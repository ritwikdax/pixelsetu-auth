import { Request, Response } from "express";
import { orgService } from "../services/org.service.js";

export default async function removeOrgMemberHandler(req: Request, res: Response){
    const { userId } = req.params;
    await orgService.removeMemberFromOrg(userId as string);
    return res.status(200).json({ success: true, message: "Member removed from organization successfully" });
}   