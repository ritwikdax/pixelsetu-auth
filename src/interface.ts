import { OrgRole } from "./types/entity.type.js";

//========CORE Application Inyerfaces========
export interface ContextStore{
    //Genereic Context Details
    requestId: string;
    endpoint: string;
    method: string;
    timestamp: number;


    //User Session Details
    email: string;
    userId: string;
    activeOrgId: string;
    tenantId: string; //It will be treated as  Tenant Id in case of multi-tenant application  
    activeRole: OrgRole;
    sessionKey: string;

}

//=======SESSION MANAGEMENT=================
export interface SessionData {
  userId: string;
  email: string;
  device: string;
  ip: string;
  sessionKey: string
  createdAt: string; //Timestamp String

  activeOrgId: string; //It will be treated as  Tenant Id in case of multi-tenant application
  activeRole: OrgRole;

}

export interface AuthContext {
    email: string;
    userId: string;
    activeOrgId: string; //It will be treated as  Tenant Id in case of multi-tenant application
    activeRole: OrgRole;
    sessionKey: string;
}  
