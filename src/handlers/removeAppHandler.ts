import { Request, Response } from "express";
import { userService } from "../services/user.service.js";

export default async function removeAppHandler(req: Request, res: Response) {
    const { appId } = req.params;
    await userService.removeApplication(appId as string);
    return res.status(200).json({ message: "App removed" });
}