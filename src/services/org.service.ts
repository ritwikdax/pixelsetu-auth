import { COLLECTIONS } from "../const.js";
import { getDb } from "../database.js";
import { HttpError } from "../error/http.error.js";
import { APP_EVENTS, appEventEmitter } from "../event/event.js";
import { OrgInviteEvent } from "../event/event.type.js";
import { orgRepo } from "../repositories/org.repository.js";
import { userRepo } from "../repositories/user.repository.js";
import { Org, OrgRole } from "../types/entity.type.js";
import { OrgInviteTokenClaims } from "../types/other.type.js";
import { context } from "../utils/context.js";
import { env } from "../utils/env.js";
import { idGeneratorService } from "./idGenerator.service.js";
import { jwtService } from "./jwt.service.js";
import { sessionManager } from "./session.servcie.js";

class OrgService {

    async checkNamespaceAvailability(namespace: string) {
        return await orgRepo.checkNamespaceAvailability(namespace);
    }

    async updateNamespace(newNamespace: string){
        const isAvailable = await orgRepo.checkNamespaceAvailability(newNamespace);
        const role = context.get("activeRole");
        const activeOrgId = context.get("activeOrgId");

        if(role !== "owner"){
            throw new HttpError("Only organization owners can update the namespace", 403);
        }
        if(!isAvailable){
            throw new HttpError("Namespace is already taken", 400);
        }
        
        return await orgRepo.updateOrgDetails({ namespace: newNamespace }, activeOrgId);
    }

    async updateOrgDetails(updatedData: Partial<Org>, orgId: string){
        return await orgRepo.updateOrgDetails(updatedData, orgId);
    }


    async getActiveOrgDetails(){
        const activeOrgId = context.get("activeOrgId");
        return await orgRepo.getOrgDetailsById(activeOrgId);
    }

    async getAllMembersOfOrg(){
        const activeOrgId = context.get("activeOrgId");
        return await orgRepo.getAllMembersOfOrg(activeOrgId);
    }

    async sendOrgInvite(toEmail: string, role: OrgRole) {
        const userEmail = context.get("email");
        if(userEmail === toEmail){
            throw new HttpError("You cannot invite yourself to the organization", 403);
        }

        const org = await this.getActiveOrgDetails();

        if(!org){
            throw new HttpError("Organization not found", 404);
        }

        const isAlreadyMember = await orgRepo.checkMembership(org.id, toEmail);
        if(isAlreadyMember){
            throw new HttpError("User is already a member of the organization", 400);
        }

        const payload: OrgInviteTokenClaims = {
            role: role,
            orgId: org.id,
            orgNamespace: org.namespace,
            orgDisplayName: org.displayName,
            toEmail: toEmail
        }

        const token = jwtService.sign(payload);
        appEventEmitter.emitEvent<OrgInviteEvent>(APP_EVENTS.SEND_ORG_INVITE, {
            to: toEmail,
            sender: org.ownerEmail,
            name: "User",
            ctaUrl: `${env('HOST')}/api/accept-invite?token=${token}`,
            orgName: org.displayName,
            orgOwner: org.ownerEmail,
            orgRole: role
        });
    }

    async addMemberFromInvitation(orgId: string, userId: string, role: OrgRole) {
        (await getDb()).collection(COLLECTIONS.MEMBERSHIPS).insertOne({
            id: idGeneratorService.randomId(),
            orgId,
            userId,
            role,
            createdAt: new Date(),
            updatedAt: new Date()
        })
    }

    async leaveOrganization(){
        const userId = context.get("userId");
        const email = context.get("email");
        const activeOrgId = context.get("activeOrgId");

        const isMember = await orgRepo.checkMembership(activeOrgId, userId);

        if(!isMember){
            throw new HttpError("You are not a member of this organization", 403);
        }

        if(isMember.role === "owner"){
            throw new HttpError("Organization owners cannot leave the organization. Please transfer ownership or delete the organization.", 403);
        }

        await orgRepo.removeMemberFromOrg(activeOrgId, userId);
        await sessionManager.deleteAllActiveSessionOfUser(email);
    }

    async switchOrganizationContext(orgId: string){
        const userId = context.get("userId");
        const sessionKey = context.get("sessionKey");

        const ismember = await orgRepo.checkMembership(orgId, userId);

        if(!ismember){
            throw new HttpError("You are not a member of this organization", 403);
        }

        await sessionManager.updateSessionData(sessionKey, "activeOrgId", orgId);
        await sessionManager.updateSessionData(sessionKey, "activeRole", ismember.role);

    }

    async removeMemberFromOrg(userId?: string){

        if(!userId){
            throw new HttpError("User ID is required to remove a member from the organization", 400);
        }

        const activeRole = context.get("activeRole");
        const activeOrgId = context.get("activeOrgId");

        if(activeRole !== "owner"){
            throw new HttpError("Only organization owners can remove members", 403);
        }

        const isMember = await orgRepo.checkMembership(activeOrgId, userId);
        if(!isMember){
            throw new HttpError("User is not a member of the organization", 404);
        }

        const useDetails = await userRepo.findById(userId);

        if(!useDetails){
            throw new HttpError("User not found", 404);
        }

        await orgRepo.removeMemberFromOrg(activeOrgId, userId);
        await sessionManager.deleteAllActiveSessionOfUser(useDetails?.email);
    }
}

export const orgService = new OrgService();