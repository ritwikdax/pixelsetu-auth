import { COLLECTIONS } from "../const.js";
import { getDb } from "../database.js";
import { APP_EVENTS, appEventEmitter } from "../event/event.js";
import { OrgInviteEvent } from "../event/event.type.js";
import { Org, OrgInviteTokenClaims, OrgRole } from "../interface.js";
import { env } from "../utils/env.js";
import { idGeneratorService } from "./idGenerator.service.js";
import { jwtService } from "./jwt.service.js";

class OrgService {
    async getUsersDefaultOrg(email: string) {
        const db = await getDb();
        return await db.collection<Org>(COLLECTIONS.ORGS).findOne({ owner: email, role: "owner" });
    }

    async getAllOrgsOfUser(email: string) {
        const db = await getDb();
        return await db.collection<Org>(COLLECTIONS.ORGS).find({ owner: email }).toArray();
    }

    async sendOrgInvite(org: Org, toEmail: string, role: OrgRole) {
        const payload: OrgInviteTokenClaims = {
            role: role,
            orgId: org.id,
            orgNamespace: org.namespace,
            orgDisplayName: org.displayName,
            toEmail: toEmail
        }

        const token = jwtService.sign(payload);
        //console.log("Generated Invite Token:", { ctUrl: `${env('HOST')}/api/accept-invite?token=${token}`, orgName: org.displayName, orgRole: role });
        appEventEmitter.emitEvent<OrgInviteEvent>(APP_EVENTS.SEND_ORG_INVITE, {
            to: toEmail,
            sender: org.owner,
            name: "User",
            ctaUrl: `${env('HOST')}/api/accept-invite?token=${token}`,
            orgName: org.displayName,
            orgOwner: org.owner,
            orgRole: role
        });
    }

    async addMemberFromInvitation(orgId: string, userId: string, role: OrgRole) {
        (await getDb()).collection(COLLECTIONS.MEMBERSHIPS).insertOne({
            id: idGeneratorService.generateRandomId(20),
            orgId,
            userId,
            role,
            createdAt: new Date(),
            updatedAt: new Date()
        })
    }

    async checkMembership(orgId: string, userId: string) {
        const db = await getDb();
        return await db.collection(COLLECTIONS.MEMBERSHIPS).findOne({ orgId, userId });
    }
}

export const orgService = new OrgService();