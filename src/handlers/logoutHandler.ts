import { Request, Response } from "express";
import { sessionManager } from "../services/session.servcie.js";

export default async function logoutHandler(req: Request, res: Response) {
  const { encryptedSessionKey } = req.body;
  await sessionManager.logoutUserSession(encryptedSessionKey);
  return res
    .clearCookie("session_id", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      ...(process.env.NODE_ENV === "production" && {
        domain: ".pixelsetu.com",
      }),
      path: "/",
    })
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
}
