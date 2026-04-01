import { Request, Response } from "express";
import { getClientDeviceInfo } from "../utils/utils.js";
import { googleLoginService } from "../services/login/googleLogin.service.js";
import { loginService } from "../services/login/login.service.js";

export default async function googleLoginHandler(req: Request, res: Response) {

    const claims = await googleLoginService.login(req);
    const sessonKey = await loginService.userLogin(claims, getClientDeviceInfo(req));

    const redirectUrl = process.env.NODE_ENV === "production"
        ? `https://home.pixelsetu.com/auth/callback?session_id=${sessonKey}`
        : `http://localhost:3000/auth/callback?session_id=${sessonKey}`;

    return res.status(302).redirect(redirectUrl);
}
