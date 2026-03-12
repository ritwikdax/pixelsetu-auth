import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { authService } from "../services/auth.service.js";
import { userService } from "../services/user.service.js";
import { idGeneratorService } from "../services/idGenerator.service.js";
import { getRedisClient } from "../redis.js";

export default async function loginHandler(req: Request, res: Response) {
    try {
        const now = new Date();
        const { code, state } = req.query;
        if (!code || !state) {
            return res.status(400).json({ error: true, message: "Code or state missing in query parameters" });
        }

        const claims = await authService.exchangeToken(code as string);
        const userId = idGeneratorService.generateIdFromEmail(claims.email);

        const user = await userService.find(userId);
        const sessionId = idGeneratorService.generateRandomId(20);

        const redisClient = await getRedisClient();
        await redisClient.set(sessionId, JSON.stringify({
            id: userId,
            email: claims.email,
            namespace: user?.namespace || userId,
        }), {
            EX: 1 * 24 * 60 * 60 // 60 days in seconds
        });

        if (!user) {
            // New user, create a new record in the database
            // You can also perform additional setup for new users here (e.g., sending welcome email)
            logger.info("New user detected, creating user record", { email: claims.email });
            await userService.createNewUser({
                id: idGeneratorService.generateIdFromEmail(claims.email),
                firstName: claims.given_name,
                lastName: claims.family_name,
                isVerified: claims.email_verified,
                name: claims.name,
                email: claims.email,
                avatarUrl: claims.picture,
                namespace: idGeneratorService.getNamespaceFromEmail(claims.email),
                isOrgOwner: true,
                createdAt: now,
                updatedAt: now,
            });

            const redirectUrl = process.env.NODE_ENV === "production"
                ? `https://pixelsetu.com/auth/callback?session_id=${sessionId}`
                : `http://localhost:3000/auth/callback?session_id=${sessionId}`;

            return res.status(302).redirect(redirectUrl);

        } else {
            logger.info("Existing user logged in", { user });
            const redirectUrl = process.env.NODE_ENV === "production"
                ? `https://pixelsetu.com/auth/callback?session_id=${sessionId}`
                : `http://localhost:3000/auth/callback?session_id=${sessionId}`;

            return res.status(302).redirect(redirectUrl);
        }


    }
    catch (err) {
        logger.error("Error in loginHandler:", err);
        return res.status(500).json({ error: true, message: "Login failed" });
    }
}
