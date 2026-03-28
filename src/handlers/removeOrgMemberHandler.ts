import { Request, Response } from "express";
import { orgService } from "../services/org.service.js";

export default async function removeOrgMemberHandler(req: Request, res: Response){
    const { email } = req.body;
    await orgService.removeMemberFromOrg(email);
    return res.status(200).json({ success: true, message: "Member removed from organization successfully" });
}   