// database mimic, use an actual database please(lvkdotsh/scyllo *wink* *wink*)

import { Logger } from "./lib/logger";
import { UniqueId } from "./lib/util";

export type User = {
    id: UniqueId
    username: string,
    password: string // hash this in actual app, this is not actual app
}

export type UserWebauthn = {
    publicKey: string,
    credentialId: string
}

const users: User[] = []

// we're gonna store webauthn data here
const userWebauthn: Record<UniqueId, UserWebauthn> = {};
const residentWebauthn: Record<UniqueId, UserWebauthn> = {};

export const DB = { users, userWebauthn, residentWebauthn };

// memory cleanup
setInterval(() => {
    Logger.info("Scheduled memory cleanup", users.length + " users", Object.keys(userWebauthn).length + " 2fa data");
    while(users.length > 0) users.pop();
    Object.keys(userWebauthn).forEach(it => delete userWebauthn[it]);
    Object.keys(residentWebauthn).forEach(it => delete userWebauthn[it]);
}, 10 * 60 * 1000);