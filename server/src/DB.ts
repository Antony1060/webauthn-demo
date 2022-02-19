// database mimic, use an actual database please(lvkdotsh/scyllo *wink* *wink*)

import { Logger } from "./lib/logger";

export type User = {
    username: string,
    password: string // hash this in actual app, this is not actual app
}

export type UserWebauthn = {
    publicKey: string,
    credentialId: string
}

const users: User[] = [
    {
        username: "demo",
        password: "demo"
    }
]

// we're gonna store webauthn data here
const userWebauthn: Record<string, UserWebauthn> = {}

export const DB = { users, userWebauthn };

// memory cleanup
setInterval(() => {
    Logger.info("Scheduled memory cleanup", users.length + " users", Object.keys(userWebauthn).length + " 2fa data");
    while(users.length > 1) users.pop();
    Object.keys(userWebauthn).forEach(it => delete userWebauthn[it]);
}, 10 * 60 * 1000);