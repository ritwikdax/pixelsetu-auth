import { COLLECTIONS } from "../const.js";
import { getDb, getDbClient } from "../database.js";
import { User } from "../interface.js";
import { idGeneratorService } from "./idGenerator.service.js";


interface UserOnboardData {
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    isVerified: boolean;
}

class UserManagementService {

    private readonly DEFAULT_APPLICATION_POOL = ["home", "split"];

    async findByEmail(email: string) {
        const db = await getDb();
        return await db.collection(COLLECTIONS.USERS).findOne<User>({ id: idGeneratorService.getUserId(email) });
    }

    async getFullUserContext(email: string){
        const user = await this.findByEmail(email);
    }


    //Onboard New User
    async onboardNewUser(userData: UserOnboardData) {
        const now = new Date();
        const db = await getDb();
        const client = await getDbClient();
        const session = client.startSession();
        
        try {
            session.startTransaction();

            await db.collection(COLLECTIONS.USERS).insertOne({
                id: idGeneratorService.getUserId(userData.email),
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                isVerified: userData.isVerified,
                avatarUrl: userData.avatarUrl,
                applicationPool: this.DEFAULT_APPLICATION_POOL,
                createdAt: now,
                updatedAt: now
            }, { session });


            await db.collection(COLLECTIONS.ORGS).insertOne({
                id: idGeneratorService.getDefaultOrgIdOfUser(userData.email),
                owner: userData.email,
                role: "owner",
                displayName: `${userData.firstName}'s Company`,
                namespace: idGeneratorService.getNamespaceFromEmail(userData.email),
                namespaceId: idGeneratorService.getDefaultNamespaceIdOfUser(userData.email),
                createdAt: now,
                updatedAt: now
            }, { session });

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
        await db.collection(COLLECTIONS.USERS).updateOne(
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

export const userService = new UserManagementService();