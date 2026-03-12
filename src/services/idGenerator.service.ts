import crypto from "crypto";
import { env } from "../utils/env.js";

const MIN = 100000000000n; // smallest 12-digit number
const MAX = 999999999999n;
const RANGE = MAX - MIN + 1n;



class IdGeneratorService {
    private readonly SALT: string;
    private readonly DEFAULT_ID_LENGTH = 16;

    constructor() {
        this.SALT = env("PIXELSETU_SECRET_SALT");
    }

    generateIdFromEmail(email: string): string {
        const normalized = email.trim().toLowerCase();

        // create salted input
        const input = `${normalized}:${this.SALT}`;

        // SHA256 hash
        const hash = crypto
            .createHash("sha256")
            .update(input)
            .digest("hex");

        // convert hash to bigint
        const hashBigInt = BigInt("0x" + hash);

        // map into 12-digit numeric range
        const numericId = (hashBigInt % RANGE) + MIN;
        return numericId.toString();
    }

    generateRandomId(length: number = this.DEFAULT_ID_LENGTH): string {
        return crypto.randomBytes(length)
            .toString("base64")
            .replace(/[^a-zA-Z0-9]/g, "")
            .slice(0, length);
    }

    getNamespaceFromEmail(email: string): string {
        const normalized = email.trim().toLowerCase();
        const username = normalized.split('@')[0];
        // Remove all non-alphanumeric characters
        return username.replace(/[^a-z0-9]/g, '');
    }
}


export const idGeneratorService = new IdGeneratorService();