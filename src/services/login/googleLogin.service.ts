import { Request } from "express";
import { HttpError } from "../../error/http.error.js";
import { env } from "../../utils/env.js";
import { http } from "../../utils/http.js";
import jwt from "jsonwebtoken";
import { LoginService } from "./login.service.js";
import { GoogleTokenClaims, StandardClaims } from "../../types/other.type.js";


class GoogleLoginService extends LoginService {
    private readonly GOOGLE_CLIENT_ID: string;
    private readonly GOOGLE_SECRET: string;
    private readonly REDIRECT_URI: string;
    private readonly GRANT_TYPE: string = "authorization_code";

    constructor() {
        super();
        this.GOOGLE_CLIENT_ID = env("GOOGLE_CLIENT_ID");
        this.REDIRECT_URI = env("GOOGLE_REDIRECT_URI");
        this.GOOGLE_SECRET = env("GOOGLE_CLIENT_SECRET");
    }

    private async exchangeToken(code: string) {

        try {
            const { data } = await http.post("https://oauth2.googleapis.com/token", {
                code,
                client_id: this.GOOGLE_CLIENT_ID,
                client_secret: this.GOOGLE_SECRET,
                redirect_uri: this.REDIRECT_URI,
                grant_type: this.GRANT_TYPE
            })
            const token = data["id_token"];
            const decodedToken = this.decodeToken(token);
            return decodedToken;
        } catch (err) {
            console.error("Error exchanging Google OAuth token:", err);
            throw new Error("Failed to exchange Google OAuth token");
        }

    }

    private decodeToken(token: string) {
        try {
            const decodedToken = jwt.decode(token) as GoogleTokenClaims;
            return decodedToken;
        } catch (err) {
            console.error("Error decoding Google OAuth token:", err);
            throw new Error("Failed to decode Google OAuth token");
        }
    }

    async login(request: Request): Promise<StandardClaims> {

        const { code, state } = request.query;
        if (!code || !state) {
            throw new HttpError("Code or state missing in query parameters", 400);
        }

        const claims = await this.exchangeToken(code as string);
        return {
            email: claims.email,
            firstName: claims.given_name,
            lastName: claims.family_name,
            isVerified: claims.email_verified,
            avatarUrl: claims.picture,
            provider: "google",
            providerGivenId: claims.sub
        } satisfies StandardClaims;
    }
}

export const googleLoginService = new GoogleLoginService();