import { Request, Response } from "express";
import { orgService } from "../services/org.service.js";

export default async function leaveOrgHandler(req: Request, res: Response){
    await orgService.leaveOrganization();
    return res.status(200).json({ success: true, message: "Left organization successfully" });
}