import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { getAuthContext } from "../utils/utils.js";
import { getRedisClient } from "../redis.js";

export default async function logoutHandler(req: Request, res: Response){

    try {
        const ctx = getAuthContext(res);
        const redisClient = await getRedisClient();
        await redisClient.del(ctx.sessionId);

        res.clearCookie("session_id", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            ...(process.env.NODE_ENV === "production" && { domain: ".pixelsetu.com" }),
        });

        return res.status(200).json({ success: true, message: "Logged out successfully" });

    } catch (err: any) {
        logger.error("Error in logoutHandler:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}