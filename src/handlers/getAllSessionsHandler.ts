import { Request, Response } from "express";
import { sessionManager } from "../services/session.servcie.js";

export default async function getAllSessionsHandler(req: Request, res: Response) {
    
    const sessions = await sessionManager.getAllSessionsOfUser();
    return res.status(200).json({ message: "Success", data: sessions });

}