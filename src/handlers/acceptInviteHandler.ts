import { Request, Response } from "express";
import { invitationService } from "../services/invite.service.js";

export default async function acceptInviteHandler(req: Request, res: Response) {
    return await invitationService.acceptInvitation(req, res);
}
