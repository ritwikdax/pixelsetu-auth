import { COLLECTIONS } from "../const.js";
import { getDb } from "../database.js";
import { Identity, IdentityProvider } from "../types/entity.type.js";

class IdentityRepository {

    async findIdentity(userEmail: string, provider: IdentityProvider= "google") {
        const db = await getDb();
        return await db.collection(COLLECTIONS.AUTH_PROVIDER_GOOGLE).findOne<Identity>({ email: userEmail, provider });
    }

    async createIdentity(identityData: Identity) {
        const db = await getDb();
        return await db.collection(COLLECTIONS.AUTH_PROVIDER_GOOGLE).insertOne(identityData); 
    }


}

export const identityRepo = new IdentityRepository();