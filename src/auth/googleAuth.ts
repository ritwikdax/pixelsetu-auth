import { GoogleTokenClaims } from "../interface.js";
import { env } from "../utils/env.js";
import { http } from "../utils/http.js";
import jwt from "jsonwebtoken";


export class GoogleAuth {

    private readonly GOOGLE_CLIENT_ID: string;
    private readonly GOOGLE_SECRET: string;
    private readonly REDIRECT_URI: string = "http://localhost:3005/api/auth/callback/google";
    private readonly GRANT_TYPE: string = "authorization_code";


    constructor() {
        this.GOOGLE_CLIENT_ID = env("GOOGLE_CLIENT_ID");
        this.GOOGLE_SECRET = env("GOOGLE_CLIENT_SECRET");
    }

    async exchangeToken(code: string) {

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


}