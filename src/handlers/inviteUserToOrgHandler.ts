import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { getAuthContext } from "../utils/utils.js";
import { orgService } from "../services/org.service.js";
import { userService } from "../services/user.service.js";

export default async function inviteUserToOrgHandler(req: Request, res: Response){

    try {
        const { email, role } = req.body;
        const ctx = getAuthContext(res);
        if(ctx.email === email){
            return res.status(400).json({success: false, message: "You cannot invite yourself to the organization" });
        }

        const org = await orgService.getUsersDefaultOrg(ctx.email);
        if (!org) {
            return res.status(404).json({success: false, message: "Organization not found" });
        }

        const user = await userService.findByEmail(email);
        console.log("inviteUserToOrgHandler - Found user:", user);

        if(!user){
            return res.status(400).json({success: false, message: "User not found!" });
        }

        const membership = await orgService.checkMembership(org.id, user.id);
        if(membership){
            return res.status(400).json({success: false, message: "User is already a member of the organization" });
        }

        await orgService.sendOrgInvite(org, email, role);
        res.status(200).json({success: true, message: "Organization invite sent successfully" });
        
    } catch (err: any) {
        logger.error("Error in inviteUserToOrgHandler:", err);
        res.status(500).json({success: false, message: "Internal Server Error" });
    }
}