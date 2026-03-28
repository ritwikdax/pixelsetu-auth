import { Request, Response } from "express";
import { userService } from "../services/user.service.js";

export default async function addAppHandler(req: Request, res: Response) {
    const { appId } = req.params;
    await userService.addApplication(appId as string);
    return res.status(200).json({ message: "App added" });
}