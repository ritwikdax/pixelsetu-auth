import { Request, Response } from "express";
import { orgService } from "../services/org.service.js";

export default async function getMyOrgHandler(req: Request , res: Response){

    const orgDetails = await orgService.getActiveOrgDetails();
    return res.status(200).json({ message: "Success", data: orgDetails });

}