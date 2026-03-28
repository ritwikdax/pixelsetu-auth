import { Request, Response } from "express";
import { orgService } from "../services/org.service.js";

export default async function inviteUserToOrgHandler(req: Request, res: Response){
    const { email, role } = req.body;
    await orgService.sendOrgInvite(email, role);
    return res.status(200).json({success: true, message: "Organization invite sent successfully" });
}
