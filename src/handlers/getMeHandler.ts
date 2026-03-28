import { Request, Response } from "express";
import { userService } from "../services/user.service.js";

export default async function getMeHandler(req: Request, res: Response) {
    const details = await userService.getCurrentUserDetails();
    return res.status(200).json({ success: "Success", data: details });
}