import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { APP_EVENTS, appEventEmitter } from "../event/event.js";
import { getAuthContext } from "../utils/utils.js";

export default async function inviteUserToOrgHandler(req: Request, res: Response){

    try {
        const { email } = req.body;
        const ctx = getAuthContext(res);

        if(ctx.email === email){
            return res.status(400).json({success: false, message: "You cannot invite yourself to the organization" });
        }

        appEventEmitter.emitEvent(APP_EVENTS.SEND_ORG_INVITE, {
            to: email,
            sender: ctx.email,
            name: "User",
            namespace: ctx.namespace,
            cta: "https://home.pixelsetu.com"
        })
        res.status(200).json({success: true, message: "Organization invite sent successfully" });
    } catch (err: any) {
        logger.error("Error in inviteUserToOrgHandler:", err);
        res.status(500).json({success: false, message: "Internal Server Error" });
    }   

}