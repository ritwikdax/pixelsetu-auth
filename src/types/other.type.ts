import { IdentityProvider, OrgRole } from "./entity.type";

export interface UserOnboardData {
    userId: string;
    providerId: string;
    provider: IdentityProvider;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    isVerified: boolean;
}

export interface OrgOnboardData {
    orgId: string;
    ownerEmail: string;
    ownerId: string;
    displayName: string;
    namespace: string;
}

export interface IdentityOnboardData {
    identityId: string;
    userId: string;
    provider: IdentityProvider;
    providerGivenId: string; //It is sub in case of google
    email: string;
}

/**
 * This is the standard structure of claims that we expect from any login service (Google, Facebook, Apple etc.)
 */
export interface StandardClaims {
    email: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
    avatarUrl: string;
    provider: IdentityProvider
    providerGivenId: string;
}

export interface LoggedInClientInfo {
    ip: string;
    device: string;
}

export interface GoogleTokenClaims {
    email: string;
    given_name: string;
    family_name: string;
    email_verified: boolean;
    picture: string;
    sub: string; //This is the unique identifier for the user in Google login
}

export interface OrgInviteTokenClaims {
    role: OrgRole;
    orgId: string;
    orgNamespace: string;
    orgDisplayName: string;
    toEmail: string;
}
