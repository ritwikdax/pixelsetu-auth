import { Request } from "express";
import { LoggedInClientInfo, StandardClaims } from "../../types/other.type.js";
import { userService } from "../user.service.js";
import { identityRepo } from "../../repositories/identity.repo.js";
import { sessionManager } from "../session.servcie.js";

export abstract class LoginService {
    abstract login(request: Request): Promise<StandardClaims>;

}

class UserLogin {
    async userLogin(claims: StandardClaims, info: LoggedInClientInfo) {
        const user = await identityRepo.findIdentity(claims.email, claims.provider);
        let userId: string;
        if (user) {
            //Existing User
            userId = user.userId;
        } else {
            //New User - Onboard them
            userId = await userService.onboardNewUser(claims);
        }
        const userDetails = await userService.findUserDataForLogin(userId);
        const sessionKey = await sessionManager.createNewLoginSession({ email: claims.email, device: info.device, ip: info.ip, activeOrgId: userDetails.defaultOrg?.id, activeRole: "owner", userId });
        return sessionKey;
    }

}

export const loginService = new UserLogin();