import { Response } from "express";

interface AuthContext{
    email: string;
    userId: string;
    namespace: string;
    sessionKey: string;    
}
export function getAuthContext(res: Response){
    return {
        email: res.locals["email"],
        userId: res.locals["userId"],
        namespace: res.locals["namespace"],
        sessionKey: res.locals["sessionKey"],
    } as AuthContext;
}