import { Request, Response } from "express";
import { context } from "../utils/context.js";
import { orgService } from "../services/org.service.js";

export async function updateOrgHandler(req: Request, res: Response) {
    const orgId = context.get("activeOrgId");
    await orgService.updateOrgDetails(req.body, orgId);
    res.status(200).json({ message: "Organization details updated successfully" });
}