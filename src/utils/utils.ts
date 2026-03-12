import { Response } from "express";

interface AuthContext{
    email: string;
    userId: string;
    namespace: string;
    sessionId: string;    
}
export function getAuthContext(res: Response){
    return {
        email: res.locals["email"],
        userId: res.locals["userId"],
        namespace: res.locals["namespace"],
        sessionId: res.locals["sessionId"],
    } as AuthContext;
}