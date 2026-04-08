import { Request, Response } from "express";
import { orgService } from "../services/org.service.js";

export default async function getBusinessDetailsPublicHandler(req: Request , res: Response){

    const { namespace } = req.params;
    if(!namespace || typeof namespace !== "string"){
        return res.status(400).json({ message: "Namespace is required" });
    }
    
    const orgDetails = await orgService.getOrgDetailsByNamespace(namespace);
    return res.status(200).json({ message: "Success", data: orgDetails });
}