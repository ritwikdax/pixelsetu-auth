import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { getAuthContext } from "../utils/utils.js";
import { userService } from "../services/user.service.js";

export default async function addAppHandler(req: Request, res: Response){


    try {

        const {appId} = req.params;
        if(!appId){
            return res.status(400).json({ message: "App ID is required" });
        }
        const ctx = getAuthContext(res);
        await userService.addApplication(ctx.userId, appId as string);
        res.status(200).json({ message: "App added" });

    } catch (err: any) {
        logger.error("Error in templateHandler:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }   

}