import { COLLECTIONS } from "../const.js";
import { getDb, getDbClient } from "../database.js";
import { Identity, Membership, Org, User } from "../types/entity.type.js";

class UserManagementRepository {

    async findByEmail(email: string) {
        const db = await getDb();
        return await db.collection(COLLECTIONS.USERS).findOne<User>({ email });
    }

    async findById(userId: string) {
        const db = await getDb();
        return await db.collection(COLLECTIONS.USERS).findOne<User>({ id: userId });
    }


    //Onboard New User
    async onboardNewUser(userData: User, orgData: Org, identityData: Identity, membershipData: Membership) {
        const db = await getDb();
        const client = await getDbClient();
        const session = client.startSession();

        try {
            session.startTransaction();

            //Create a identity entity for the user
            await db.collection<Identity>(COLLECTIONS.AUTH_PROVIDER_GOOGLE).insertOne(identityData, { session });


            //Create User Entity
            await db.collection(COLLECTIONS.USERS).insertOne(userData, { session });


            //Create Default Org for the User
            await db.collection<Org>(COLLECTIONS.ORGS).insertOne(orgData, { session });

            //Add Membership entry for the user in the default org
            await db.collection(COLLECTIONS.MEMBERSHIPS).insertOne(
                membershipData
                , { session });

            await session.commitTransaction();

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async addApplication(userId: string, appId: string) {
        // Implement logic to add an application to the user's profile
        const db = await getDb();
        return await db.collection(COLLECTIONS.USERS).updateOne(
            { id: userId },
            { $addToSet: { applicationPool: appId } }
        );
    }

    async removeApplication(userId: string, appId: string) {
        const db = await getDb();
        await db.collection<User>(COLLECTIONS.USERS).updateOne(
            { id: userId },
            { $pull: { applicationPool: appId } }
        );

    }
}

export const userRepo = new UserManagementRepository();