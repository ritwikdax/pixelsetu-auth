import { Request, Response } from "express";
import { getClientDeviceInfo } from "../utils/utils.js";
import { googleLoginService } from "../services/login/googleLogin.service.js";
import { loginService } from "../services/login/login.service.js";

export default async function googleLoginHandler(req: Request, res: Response) {

    const claims = await googleLoginService.login(req);
    const sessonKey = await loginService.userLogin(claims, getClientDeviceInfo(req));

    const redirectUrl = process.env.NODE_ENV === "production"
        ? `https://home.pixelsetu.com/auth/callback?session_id=${sessonKey}`
        : `http://localhost:3000/auth/callback?session_id=${sessonKey}`;

    return res.status(302).redirect(redirectUrl);


    // try {
    //     const { code, state } = req.query;
    //     if (!code || !state) {
    //         return res.status(400).json({ error: true, message: "Code or state missing in query parameters" });
    //     }
    //     const claims = await authService.exchangeToken(code as string);
    //     const userAgent = getClientDeviceInfo(req);
    //     const user = await userService.findByEmail(claims.email);

    //     // Create a new session for the user
    //     logger.info("Creating new session for user", { email: claims.email, device: userAgent.device, ip: userAgent.ip });
    //     const sessionKey = await sessionManager.createNewLoginSession({
    //         email: claims.email,
    //         device: userAgent.device,
    //         ip: userAgent.ip,
    //         activeOrgId: idGeneratorService.getDefaultOrgIdOfUser(claims.email),
    //         activeRole: "owner"
    //     });

    //     if (!user) {
    //         // New user, create a new record in the database
    //         // You can also perform additional setup for new users here (e.g., sending welcome email)
    //         logger.info("New user login detected, creating user record", { email: claims.email });
    //         await userService.onboardNewUser({
    //             email: claims.email,
    //             firstName: claims.given_name,
    //             lastName: claims.family_name,
    //             isVerified: claims.email_verified,
    //             avatarUrl: claims.picture,
    //         });

    //         appEventEmitter.emitEvent(APP_EVENTS.SEND_WELCOME_EMAIL, {
    //             name: claims.given_name,
    //             email: claims.email,
    //             ctaUrl: `https://home.pixelsetu.com`,
    //         } as WelcomeEmailEvent);            
    //     }
    //     const redirectUrl = process.env.NODE_ENV === "production"
    //         ? `https://home.pixelsetu.com/auth/callback?session_id=${sessionKey}`
    //         : `http://localhost:3000/auth/callback?session_id=${sessionKey}`;

    //     return res.status(302).redirect(redirectUrl);
    // }
    // catch (err) {
    //     logger.error("Error in loginHandler:", err);
    //     return res.status(500).json({ error: true, message: "Login failed" });
    // }
}
