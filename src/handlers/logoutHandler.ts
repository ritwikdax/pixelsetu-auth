import e, { Request, Response } from "express";
import { sessionManager } from "../services/session.servcie.js";

export default async function logoutHandler(req: Request, res: Response){
    const { encryptedSessionKey } = req.body;
    await sessionManager.logoutUserSession(encryptedSessionKey);
    return res.status(200).json({ success: true, message: "Logged out successfully" });
}