import { NextFunction, Request, Response } from "express"
import { JwtPayload, verify } from "jsonwebtoken"
import { DB, User } from "../DB"

export type AuthenticatedRequest = Request & {
    user?: User
}

const validateToken = (token?: string): User | undefined => {
    let jwt: string | JwtPayload;
    try {
        jwt = verify(token ?? "", "verySecureIKnow");
    } catch {
        return;
    }

    if(typeof jwt === "string" || !jwt.username)
        return;

    const user = DB.users.find(it => it.username === (jwt as JwtPayload).username);
    return user;
}

export const useAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const auth = req.header("authorization");

    if(!auth || !auth.startsWith("Bearer "))
        return res.status(401).end();

    const token = auth.slice("Bearer ".length);
    const validated = validateToken(token);
    if(!validated)
        return res.status(401).end();

    req.user = validated;
    next();
}