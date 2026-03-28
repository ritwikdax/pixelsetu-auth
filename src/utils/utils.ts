import { Request, Response } from "express";
import Bowser from "bowser";
import { AuthContext } from "../interface";
import { LoggedInClientInfo } from "../types/other.type";




export function getAuthContext(res: Response) {
    return {
        email: res.locals["email"],
        userId: res.locals["userId"],
        activeOrgId: res.locals["activeOrgId"],
        activeRole: res.locals["activeRole"],
        sessionKey: res.locals["sessionKey"],
    } as AuthContext;
}



export function getClientDeviceInfo(req: Request): LoggedInClientInfo {
    const browser = Bowser.getParser(req.headers["user-agent"] as any);
    const info = browser.getResult();
    const ip = req.headers["x-forwarded-for"]?.toString()?.split(",")?.[0] ||
        req.socket.remoteAddress ||
        req.ip ||
        "ip-not-detected"

    return {
        ip,
        device: `${info.platform.vendor} - ${info.platform.type}, ${info.browser.name} ${info.os.name} ${info.os.versionName || info.os.version}`.trim(),
    };
}