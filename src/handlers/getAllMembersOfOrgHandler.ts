import { Request, Response } from "express";
import { orgService } from "../services/org.service.js";

export default async function getAllMembersOfOrgHandler(req: Request, res: Response) {
    const members = await orgService.getAllMembersOfOrg();
    res.status(200).json({ message: "Success", data: members });
}