import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { authService } from "../services/auth.service.js";
import { userService } from "../services/user.service.js";
import { idGeneratorService } from "../services/idGenerator.service.js";
import { getRedisClient } from "../redis.js";
import { WelcomeEmailEvent } from "../event/event.type.js";
import { APP_EVENTS, appEventEmitter } from "../event/event.js";

export default async function loginHandler(req: Request, res: Response) {
    try {
        const { code, state } = req.query;
        if (!code || !state) {
            return res.status(400).json({ error: true, message: "Code or state missing in query parameters" });
        }

        
        const claims = await authService.exchangeToken(code as string);
        const userId = idGeneratorService.getUserId(claims.email);
        const user = await userService.findByEmail(claims.email);
        const sessionKey = idGeneratorService.generateRandomSessionKey();
        const redisClient = await getRedisClient();

        redisClient.set(sessionKey, JSON.stringify({
            id: userId,
            email: claims.email,
            namespace: idGeneratorService.getDefaultNamespaceIdOfUser(claims.email) || userId,
        }), {
            EX: 60 * 24 * 60 * 60 // 60 days in seconds
        });

        redisClient.sAdd(idGeneratorService.getUserSessionStoreId(claims.email), sessionKey);

        if (!user) {
            // New user, create a new record in the database
            // You can also perform additional setup for new users here (e.g., sending welcome email)
            logger.info("New user detected, creating user record", { email: claims.email });

            await userService.onboardNewUser({
                email: claims.email,
                firstName: claims.given_name,
                lastName: claims.family_name,
                isVerified: claims.email_verified,
                avatarUrl: claims.picture,
            });

            appEventEmitter.emitEvent(APP_EVENTS.SEND_WELCOME_EMAIL, {
                name: claims.given_name,
                email: claims.email,
                ctaUrl: `https://home.pixelsetu.com`,
            } as WelcomeEmailEvent);            
        }

        const redirectUrl = process.env.NODE_ENV === "production"
            ? `https://home.pixelsetu.com/auth/callback?session_id=${sessionKey}`
            : `http://localhost:3000/auth/callback?session_id=${sessionKey}`;

        return res.status(302).redirect(redirectUrl);


    }
    catch (err) {
        logger.error("Error in loginHandler:", err);
        return res.status(500).json({ error: true, message: "Login failed" });
    }
}
