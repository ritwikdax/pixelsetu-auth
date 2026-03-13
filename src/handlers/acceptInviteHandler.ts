import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { jwtService } from "../services/jwt.service.js";
import { OrgInviteTokenClaims } from "../interface.js";
import { orgService } from "../services/org.service.js";
import { idGeneratorService } from "../services/idGenerator.service.js";
import { userService } from "../services/user.service.js";

export default async function acceptInviteHandler(req: Request, res: Response) {
    try {
        const { token } = req.query;
        if (!token || typeof token !== "string") {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html><head><meta charset="utf-8"><title>Invalid Request</title></head>
                <body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5">
                    <div style="text-align:center;padding:2rem;background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);max-width:400px">
                        <div style="font-size:48px;margin-bottom:1rem">⚠️</div>
                        <h1 style="margin:0 0 0.5rem;font-size:1.5rem;color:#d32f2f">Invalid Request</h1>
                        <p style="margin:0;color:#666">Invite token is required</p>
                    </div>
                </body></html>
            `);
        }
        const claims = jwtService.verify<OrgInviteTokenClaims>(token);
        if (!claims) {
            return res.status(401).send(`
                <!DOCTYPE html>
                <html><head><meta charset="utf-8"><title>Invalid Invite</title></head>
                <body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5">
                    <div style="text-align:center;padding:2rem;background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);max-width:400px">
                        <div style="font-size:48px;margin-bottom:1rem">🔒</div>
                        <h1 style="margin:0 0 0.5rem;font-size:1.5rem;color:#d32f2f">Invalid Invite</h1>
                        <p style="margin:0;color:#666">This invite link is invalid or has expired</p>
                    </div>
                </body></html>
            `);
        }
        const userId = idGeneratorService.getUserId(claims.toEmail);
        const membership = await orgService.checkMembership(claims.orgId, userId);

        if (membership) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html><head><meta charset="utf-8"><title>Already a Member</title></head>
                <body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5">
                    <div style="text-align:center;padding:2rem;background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);max-width:400px">
                        <div style="font-size:48px;margin-bottom:1rem">ℹ️</div>
                        <h1 style="margin:0 0 0.5rem;font-size:1.5rem;color:#f57c00">Already a Member</h1>
                        <p style="margin:0;color:#666">You are already a member of this organization</p>
                    </div>
                </body></html>
            `);
        }

        const user = await userService.findByEmail(claims.toEmail);
        if (!user) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html><head><meta charset="utf-8"><title>User Not Found</title></head>
                <body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5">
                    <div style="text-align:center;padding:2rem;background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);max-width:400px">
                        <div style="font-size:48px;margin-bottom:1rem">👤</div>
                        <h1 style="margin:0 0 0.5rem;font-size:1.5rem;color:#d32f2f">User Not Registered</h1>
                        <p style="margin:0;color:#666">Please register an account before accepting this invite</p>
                    </div>
                </body></html>
            `);
        }

        //Add User As Member of the org
        await orgService.addMemberFromInvitation(claims.orgId, userId, claims.role);
        return res.status(200).send(`
            <!DOCTYPE html>
            <html><head><meta charset="utf-8"><title>Invite Accepted</title></head>
            <body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5">
                <div style="text-align:center;padding:2rem;background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);max-width:400px">
                    <div style="font-size:48px;margin-bottom:1rem">✅</div>
                    <h1 style="margin:0 0 0.5rem;font-size:1.5rem;color:#2e7d32">Success!</h1>
                    <p style="margin:0;color:#666">You have been added to the organization</p>
                </div>
            </body></html>
        `);

    } catch (err: any) {
        logger.error("Error in acceptInviteHandler:", err);
        return res.status(500).send(`
            <!DOCTYPE html>
            <html><head><meta charset="utf-8"><title>Error</title></head>
            <body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5">
                <div style="text-align:center;padding:2rem;background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);max-width:400px">
                    <div style="font-size:48px;margin-bottom:1rem">❌</div>
                    <h1 style="margin:0 0 0.5rem;font-size:1.5rem;color:#d32f2f">Error</h1>
                    <p style="margin:0;color:#666">Something went wrong. Please try again later</p>
                </div>
            </body></html>
        `);
    }
}
