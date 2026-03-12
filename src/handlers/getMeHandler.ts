import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { getAuthContext } from "../utils/utils.js";
import { userService } from "../services/user.service.js";

export default async function getMeHandler(req: Request, res: Response){

    try {
        // Your handler logic here
        const ctx = getAuthContext(res);        
        const user = await userService.find(ctx.userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json({ success: true, data: user });
    } catch (err: any) {
        logger.error("Error in getMeHandler:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }   

}