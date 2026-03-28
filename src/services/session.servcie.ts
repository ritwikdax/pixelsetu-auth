import { HttpError } from "../error/http.error.js";
import { SessionData } from "../interface.js";
import { getRedisClient } from "../redis.js";
import { context } from "../utils/context.js";
import { cryptoService } from "./crypto.service.js";
import { idGeneratorService } from "./idGenerator.service.js";

class SessionManagementService {

    private readonly DEFAULT_SESSION_EXPIRY = 60 * 24 * 60 * 60; // 60 days in seconds

    async getAllSessionsOfUser() {
        const email = context.get('email');
        const activeSessionKey = context.get('sessionKey');

        const redisClient = await getRedisClient();
        const userSessionStoreId = idGeneratorService.getUserSessionStoreId(email);
        const sessionKeys = await redisClient.sMembers(userSessionStoreId);

        if (sessionKeys.length === 0) {
            return [];
        }
        const arr = new Array<SessionData>();

        for (const key of sessionKeys) {
            try {
                // Check if key exists and is of type hash
                const keyType = await redisClient.type(key);

                if (keyType !== 'hash') {
                    // Remove invalid key from the set
                    await redisClient.sRem(userSessionStoreId, key);
                    continue;
                }
                const data = await redisClient.hGetAll(key);
                // If no data returned, key doesn't exist or is empty
                if (Object.keys(data).length === 0) {
                    await redisClient.sRem(userSessionStoreId, key);
                    continue;
                }

                arr.push(data as unknown as SessionData);
            } catch (error) {
                // If any error occurs with this key, remove it from the set and continue
                await redisClient.sRem(userSessionStoreId, key);
                continue;
            }
        }

        return arr.map((s) => {
            return {
                id: idGeneratorService.randomId(),
                createdAt: s.createdAt,
                device: s.device,
                activeOrgId: s.activeOrgId,
                activeRole: s.activeRole,
                isCurrentSession: s.sessionKey === activeSessionKey,
                encryptedSessionKey: cryptoService.encrypt(s.sessionKey),
            }

        });
    }


    async createNewLoginSession(data: Pick<SessionData, "email" | "device" | "ip" | "activeOrgId" | "activeRole" | "userId">): Promise<string> {
        const sessionKey = idGeneratorService.generateRandomSessionKey();
        const redisClient = await getRedisClient();
        await redisClient.hSet(sessionKey, { ...data, sessionKey, createdAt: new Date().toISOString() });
        await redisClient.expire(sessionKey, this.DEFAULT_SESSION_EXPIRY);
        await redisClient.sAdd(idGeneratorService.getUserSessionStoreId(data.email), sessionKey);
        return sessionKey;
    }

    async getSessionData(sessionKey: string): Promise<SessionData | null> {
        const redisClient = await getRedisClient();
        const data = await redisClient.hGetAll(sessionKey);
        if (Object.keys(data).length === 0) {
            return null;
        }
        return data as unknown as SessionData;
    }

    async deleteSession(sessionKey: string) {
        const redisClient = await getRedisClient();
        const sessionData = await this.getSessionData(sessionKey);
        if (sessionData) {
            await redisClient.sRem(idGeneratorService.getUserSessionStoreId(sessionData.email), sessionKey);
        }
        await redisClient.del(sessionKey);
    }

    async updateSessionData(sessionKey: string, key: keyof SessionData, value: string) {
        const redisClient = await getRedisClient();
        await redisClient.hSet(sessionKey, key, value);
        await redisClient.expire(sessionKey, this.DEFAULT_SESSION_EXPIRY);
    }

    async deleteAllActiveSessionOfUser(email: string) {
        const redisClient = await getRedisClient();
        const userSessionStoreId = idGeneratorService.getUserSessionStoreId(email);
        const sessionKeys = await redisClient.sMembers(userSessionStoreId);

        if (sessionKeys.length === 0) {
            throw new HttpError("No active sessions found for the user", 404);
        }

        for (const key of sessionKeys) {
            await redisClient.del(key);
        }

        await redisClient.del(userSessionStoreId);
    }

    async checkIfValidSessionKeyForUser(email: string, sessionKey: string): Promise<boolean> {
        const redisClient = await getRedisClient();
        const userSessionStoreId = idGeneratorService.getUserSessionStoreId(email);
        const isMember = await redisClient.sIsMember(userSessionStoreId, sessionKey);
        return !!isMember;
    }

    async logoutUserSession(encryptedSessionKey?: string){
        if(encryptedSessionKey){
            const decryptedSessionKey = cryptoService.decrypt(encryptedSessionKey);
            const isValidSessionKey = await this.checkIfValidSessionKeyForUser(context.get("email"), decryptedSessionKey);
            if(!isValidSessionKey){
                throw new HttpError("Invalid session key", 400);
            }
            await this.deleteSession(decryptedSessionKey);
        }

        const activeSessionKey = context.get("sessionKey");
        await this.deleteSession(activeSessionKey);
    }

}
export const sessionManager = new SessionManagementService();
