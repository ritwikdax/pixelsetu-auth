import crypto from "crypto";
import { env } from "../utils/env.js";

const MIN = 10000000000000n; // smallest 14-digit number
const MAX = 99999999999999n; // largest 14-digit number
const RANGE = MAX - MIN + 1n;



class IdGeneratorService {
    private readonly SALT: string;
    private readonly DEFAULT_ID_LENGTH = 16;

    constructor() {
        this.SALT = env("PIXELSETU_SECRET_SALT");
    }

    /**
     * 
     * @param email 
     * @returns Always return 14 digit neumerical id same for same email id
     */
    private generateNumericalIdFromEmail(email: string): string {
        const normalized = email.trim().toLowerCase();
        const input = `${normalized}:${this.SALT}`;

        // SHA256 hash
        const hash = crypto
            .createHash("sha256")
            .update(input)
            .digest("hex");

        // convert hash to bigint
        const hashBigInt = BigInt("0x" + hash);

        // map into 14-digit numeric range
        const numericId = (hashBigInt % RANGE) + MIN;
        return numericId.toString();
    }

    generateRandomId(length: number = this.DEFAULT_ID_LENGTH): string {
        return crypto.randomBytes(length)
            .toString("base64")
            .replace(/[^a-zA-Z0-9]/g, "")
            .slice(0, length);
    }


    getDefaultOrgIdOfUser(email: string){
        return `ORG${this.generateNumericalIdFromEmail(email)}`;
    }

    getUserId(email: string){
        return `USR${this.generateNumericalIdFromEmail(email)}`;
    }

    getDefaultNamespaceIdOfUser(email: string){
        return `NS${this.generateNumericalIdFromEmail(email)}`;
    }

    getNamespaceFromEmail(email: string): string {
        const normalized = email.trim().toLowerCase();
        const username = normalized.split('@')[0];
        // Remove all non-alphanumeric characters
        return username.replace(/[^a-z0-9]/g, '');
    }

    generateRandomSessionKey(){
        return `sessionKey:${this.generateRandomId(24)}`;
    }

    getUserSessionStoreId(email: string){
        return `userSessionStore:${this.generateNumericalIdFromEmail(email)}`;
    }
}


export const idGeneratorService = new IdGeneratorService();