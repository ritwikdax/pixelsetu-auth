import { customAlphabet } from "nanoid";

class IdGeneratorService {
    private readonly DEFAULT_ID_LENGTH = 24;


    randomNumericalId(length: number = this.DEFAULT_ID_LENGTH): string {
        const alphabet = "0123456789";
        const nanoid = customAlphabet(alphabet, length);
        return nanoid();
    }

    randomId(length: number = this.DEFAULT_ID_LENGTH): string {
        // Exclude easily confusable characters like 0, O, I, l
        const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYabcdefghijkmnpqrstuvwxy3456789";
        const nanoid = customAlphabet(alphabet, length);
        return nanoid();
    }


    // generateRandomId(length: number = this.DEFAULT_ID_LENGTH): string {
    //     return crypto.randomBytes(length)
    //         .toString("base64")
    //         .replace(/[^a-zA-Z0-9]/g, "")
    //         .slice(0, length);
    // }


    // getDefaultOrgIdOfUser(email: string){
    //     return `ORG${this.generateNumericalIdFromEmail(email)}`;
    // }

    // getUserId(email: string){
    //     return `USR${this.generateNumericalIdFromEmail(email)}`;
    // }

    // getDefaultNamespaceIdOfUser(email: string){
    //     return `NSP${this.generateNumericalIdFromEmail(email)}`;
    // }

    getNamespaceFromEmail(email: string): string {
        const normalized = email.trim().toLowerCase();
        const username = normalized.split('@')[0];
        // Remove all non-alphanumeric characters
        return username.replace(/[^a-z0-9]/g, '');
    }

    generateRandomSessionKey(){
        return `sessionKey:${this.randomId(24)}`;
    }

    getUserSessionStoreId(email: string){
        return `userSessionStore:${email}`;
    }
}


export const idGeneratorService = new IdGeneratorService();