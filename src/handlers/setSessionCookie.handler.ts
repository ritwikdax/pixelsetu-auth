import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { sessionManager } from "../services/session.servcie.js";

export default async function setSessionCookieHandler(req: Request, res: Response) {
    try {
        const { sessionId } = req.body;
        
        if (!sessionId) {
            return res.status(400).json({ error: true, message: "sessionId is required" });
        }

        // Verify the session exists in Redis
        const sessionData = await sessionManager.getSessionData(sessionId);
        
        if (!sessionData) {
            return res.status(401).json({ error: true, message: "Invalid or expired session" });
        }

        // Set the cookie
        res.cookie("session_id", sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            ...(process.env.NODE_ENV === "production" && { domain: ".pixelsetu.com" }),
            maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days
        });

        logger.info("Session cookie set successfully", { sessionId });
        
        return res.status(200).json({ 
            success: true, 
            message: "Cookie set successfully",
            user: sessionData
        });

    } catch (err) {
        logger.error("Error in setSessionCookieHandler:", err);
        return res.status(500).json({ error: true, message: "Failed to set cookie" });
    }
}
