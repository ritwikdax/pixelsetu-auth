import jwt from "jsonwebtoken";
import { env } from "./env.js";

export interface InviteTokenPayload {
    email: string;
    namespace: string;
    sender: string;
    type: "org_invite";
}

export function generateInviteUrl(payload: InviteTokenPayload): string {
    const baseUrl = process.env.NODE_ENV === "production" 
        ? "https://home.pixelsetu.com"
        : "http://localhost:3000";
    
    // Sign the token with 7 days expiration
    const token = jwt.sign(
        payload,
        env("JWT_SECRET"),
        { expiresIn: "7d" }
    );

    return `${baseUrl}/invite/accept?token=${token}`;
}

export function verifyInviteToken(token: string): InviteTokenPayload | null {
    try {
        const decoded = jwt.verify(token, env("JWT_SECRET")) as InviteTokenPayload;
        return decoded;
    } catch (err) {
        return null;
    }
}
