//=============CORE ENTITY INTERFACES ================
interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrgRole = "owner" | "admin" | "editor" | "viewer";
export type IdentityProvider = "google" | "facebook" | "apple" | "other";



export interface User extends Entity {
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  avatarUrl: string;
  isVerified: boolean;
  applicationPool?: Array<string>;
}


export interface Org extends Entity {
  namespace: string;
  ownerId: string;
  ownerEmail: string; //It is email of owner
  displayName: string;
  businessEmail?:Array<string>;
  phone?: Array<string>;
  website?: string;
  address?: string;
}



export interface Membership extends Entity {
  orgId: string;
  userId: string;
  role: OrgRole;
}


//Identity Provider (Google, Facebook, Apple etc.)
export interface Identity extends Entity {
    userId: string;
    provider: IdentityProvider;
    providerGivenId: string; //It is sub in case of google
    email: string;
}
