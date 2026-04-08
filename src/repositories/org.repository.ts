import { COLLECTIONS } from "../const.js";
import { getDb } from "../database.js";
import { idGeneratorService } from "../services/idGenerator.service.js"
import { Org, OrgRole } from "../types/entity.type.js";

class OrgRepository {

    async getOrgDetailsByNamespace(namespace: string) {
        const db = await getDb();
        return await db.collection<Org>(COLLECTIONS.ORGS).findOne({ namespace }, { projection: { _id: 0, id: 0, ownerEmail: 0, ownerId: 0, createdAt: 0, updatedAt: 0 } });
    }


    async updateOrgDetails(updatedData: Partial<Org>, orgId: string) {
        const db = await getDb();
        await db.collection(COLLECTIONS.ORGS).updateOne({ id: orgId }, { $set: updatedData });
    }

    async checkNamespaceAvailability(namespace: string) {
        const db = await getDb();
        const org = await db.collection(COLLECTIONS.ORGS).findOne({ namespace });
        return !org;
    }

    async getDefaultOrgIdOfUser(userId: string) {
        const db = await getDb();
        return await db.collection(COLLECTIONS.ORGS).findOne({ ownerId: userId });
    }

    async getOrgDetailsById(orgId: string) {
        const db = await getDb();
        return await db.collection<Org>(COLLECTIONS.ORGS).findOne({ id: orgId });
    }

    async getEffectiveOrgsOfUser(userId: string) {
        const db = await getDb();
        const pipeline = [
            {
                $match: {
                    userId: userId
                }
            },
            {
                $lookup: {
                    from: COLLECTIONS.ORGS,
                    localField: "orgId",
                    foreignField: "id",
                    as: "orgDetails"
                }
            },
            {
                $unwind: "$orgDetails"
            },
            {
                $project: {
                    _id: 0,
                    id: "$orgDetails.id",
                    namespace: "$orgDetails.namespace",
                    displayName: "$orgDetails.displayName",
                    role: "$role"
                }

            }
        ];
        return await db.collection<Org>(COLLECTIONS.MEMBERSHIPS).aggregate(pipeline).toArray();
    }

    async checkMembership(orgId: string, userId: string) {
        const db = await getDb();
        return await db.collection(COLLECTIONS.MEMBERSHIPS).findOne({ orgId, userId });
    }

    async checkMembershipByEmail(orgId: string, email: string) {
        const db = await getDb();
        const pipeline = [
            {
                $match: {
                    orgId: orgId
                }
            },
            {
                $lookup: {
                    from: COLLECTIONS.USERS,
                    localField: "userId",
                    foreignField: "id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $match: {
                    "userDetails.email": email
                }
            }
        ];
        const result = await db.collection(COLLECTIONS.MEMBERSHIPS).aggregate(pipeline).toArray();
        return result?.length > 0 ? result[0] : null;
    }

    async getAllMembersOfOrg(orgId: string) {
        const db = await getDb();
        const pipeline = [
            {
                $match: {
                    orgId: orgId
                }
            },
            {
                $lookup: {
                    from: COLLECTIONS.USERS,
                    localField: "userId",
                    foreignField: "id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    _id: 0,
                    id: "$userDetails.id",
                    email: "$userDetails.email",
                    firstName: "$userDetails.firstName",
                    lastName: "$userDetails.lastName",
                    avatarUrl: "$userDetails.avatarUrl",
                    role: "$role"
                }
            }];
        return await db.collection(COLLECTIONS.MEMBERSHIPS).aggregate(pipeline).toArray();
    }

    async removeMemberFromOrg(orgId: string, userId: string) {
        const db = await getDb();
        return await db.collection(COLLECTIONS.MEMBERSHIPS).deleteOne({ orgId, userId, role: { $ne: "owner" } });
    }

    async addMemberFromInvitation(orgId: string, userId: string, role: OrgRole) {
        const db = await getDb();
        await db.collection(COLLECTIONS.MEMBERSHIPS).insertOne({
            id: idGeneratorService.randomId(),
            orgId,
            userId,
            role,
            createdAt: new Date(),
            updatedAt: new Date()
        })
    }
}

export const orgRepo = new OrgRepository();