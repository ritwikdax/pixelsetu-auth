import crypto from "crypto";
import { Buffer } from "buffer";
import { env } from "../utils/env.js";

class CryptoService {

    private readonly ALGORITHM = "aes-256-gcm";
    private readonly IV_BYTE_LEN = 12;
    private readonly ENCRYPTION_KEY: string;

    constructor(){
        this.ENCRYPTION_KEY = env("SECRET_ENCRYPTION_KEY");
    }

    encrypt(plaintext: string): string {
        const iv = crypto.randomBytes(this.IV_BYTE_LEN);
        const key = Buffer.from(this.ENCRYPTION_KEY, "hex");
        const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
        const encryptedMessage = Buffer.concat([
            cipher.update(plaintext, "utf8"),
            cipher.final()
        ]);
        const authTag = cipher.getAuthTag();
        return Buffer.concat([iv, encryptedMessage, authTag]).toString("base64");
    }

    decrypt(ciphertextBase64: string): string {
        const combined = Buffer.from(ciphertextBase64, "base64");
        const iv = combined.slice(0, this.IV_BYTE_LEN);
        const authTag = combined.slice(-16);
        const encryptedMessage = combined.slice(this.IV_BYTE_LEN, -16);
        const key = Buffer.from(this.ENCRYPTION_KEY, "hex");
        const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([
            decipher.update(encryptedMessage),
            decipher.final()
        ]);
        return decrypted.toString("utf8");
    }
}

export const cryptoService = new CryptoService();