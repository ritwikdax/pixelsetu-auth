import { Request, Response } from "express";
import { orgService } from "../services/org.service.js";


export default async function switchActiveOrganizationHandler(req: Request, res: Response){
    const {orgId} = req.body;
    await orgService.switchOrganizationContext(orgId);
    return res.status(200).json({ success: true, message: "Organization switched successfully" });
}