import { HttpError } from "../error/http.error.js";
import { APP_EVENTS, appEventEmitter } from "../event/event.js";
import { WelcomeEmailEvent } from "../event/event.type.js";
import { orgRepo } from "../repositories/org.repository.js";
import { userRepo } from "../repositories/user.repository.js";
import { IdentityProvider } from "../types/entity.type.js";
import { StandardClaims } from "../types/other.type.js";
import { context } from "../utils/context.js";
import { idGeneratorService } from "./idGenerator.service.js";


class UserManagementService {

    private readonly DEFAULT_APPLICATION_POOL = ["home", "split"];

    async getCurrentUserDetails() {
        const userId = context.get("userId");
        const user = await userRepo.findById(userId);
        if (!user) {
            throw new HttpError("User not found", 404);
        }
        const effectiveOrgs = await orgRepo.getEffectiveOrgsOfUser(userId);

        return {
            ...user, effectiveOrgs, activeOrgId: context.get("activeOrgId"), activeRole: context.get("activeRole")
        }
    }

    async findUserDataForLogin(userId: string) {
        const user = await userRepo.findById(userId);
        if (!user) {
            throw new HttpError("User not found", 404);
        }

        const defaultOrg = await orgRepo.getDefaultOrgIdOfUser(userId);
        return { ...user, defaultOrg: defaultOrg };

    }

    //Onboard New User
    async onboardNewUser(userData: StandardClaims) {
        const newUserId = idGeneratorService.randomId();
        const newOrgId = idGeneratorService.randomId();

        const now = new Date();

        await userRepo.onboardNewUser({
            id: newUserId,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            isVerified: userData.isVerified,
            avatarUrl: userData.avatarUrl,
            isActive: true,
            applicationPool: this.DEFAULT_APPLICATION_POOL,
            createdAt: now,
            updatedAt: now

        }, {
            id: newOrgId,
            ownerEmail: userData.email,
            ownerId: newUserId,
            displayName: `${userData.firstName}'s Company`,
            namespace: idGeneratorService.getNamespaceFromEmail(userData.email),
            createdAt: now,
            updatedAt: now
        }, {
            id: idGeneratorService.randomId(),
            userId: newUserId,
            provider: userData.provider as IdentityProvider,
            providerGivenId: userData.providerGivenId, //It is sub in case of google
            email: userData.email,
            createdAt: now,
            updatedAt: now
        },
            {
                id: idGeneratorService.randomId(),
                orgId: newOrgId,
                userId: newUserId,
                role: "owner",
                createdAt: now,
                updatedAt: now

            }

        );

        appEventEmitter.emitEvent(APP_EVENTS.SEND_WELCOME_EMAIL, {
            name: userData.firstName,
            email: userData.email,
            ctaUrl: `https://home.pixelsetu.com`,
        } as WelcomeEmailEvent);

        return newUserId;
    }

    async addApplication(appId?: string) {
        if (!appId) {
            throw new HttpError("App ID is required");
        }
        const userId = context.get("userId");
        return await userRepo.addApplication(userId, appId);
    }

    async removeApplication(appId?: string) {
        if (!appId) {
            throw new HttpError("App ID is required");
        }
        const userId = context.get("userId");
        return await userRepo.removeApplication(userId, appId);
    }

}

export const userService = new UserManagementService();