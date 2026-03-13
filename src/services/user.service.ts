import { getDb } from "../database.js";
import { User } from "../interface.js";

class UserManagementService {

    private readonly COLLECTION_NAME = "users";


    async registerUser(userData: any) {
        // Implement user registration logic here
        // This could involve validating the input, hashing passwords, and storing user data in a database
    }

    async loginUser(credentials: any) {
        // Implement user login logic here
        // This could involve validating credentials, generating JWT tokens, etc.
    }

    async getUserProfile(id: string) {
        // Implement logic to retrieve user profile information here
    }

    async find(id: string) {
        const db = await getDb();
        return await db.collection(this.COLLECTION_NAME).findOne<User>({ id });
    }

    async createNewUser(userData: User) {
        const db = await getDb();
        await db.collection(this.COLLECTION_NAME).insertOne(userData);
    }

    async addApplication(userId: string, appId: string) {
        // Implement logic to add an application to the user's profile
        const db = await getDb();
        await db.collection(this.COLLECTION_NAME).updateOne(
            { id: userId },
            { $addToSet: { applicationPool: appId } }
        );
    }

    async removeApplication(userId: string, appId: string) {
        const db = await getDb();
        await db.collection<User>(this.COLLECTION_NAME).updateOne(
            { id: userId },
            { $pull: { applicationPool: appId } }
        );

    }
}

export const userService = new UserManagementService();