import { Router } from "express";
import { sign } from "jsonwebtoken";
import { DB } from "../DB";
import { generateUniqueId, hasAll } from "../lib/util";
import { Assertion, WebAuthN } from "../lib/WebAuthN";

const AuthHandler = Router();

AuthHandler.post("/login", async (req, res) => {
    const body = req.body;
    if(!hasAll(body, "username", "password"))
        return res.status(400).end();
    
    const user = DB.users.find(it => it.username === body.username);
    if(!user || user.password !== body.password)
        return res.status(403).end();
    
    const webauthn = DB.userWebauthn[user.id];
    if(webauthn) {
        if(!req.body.assertion)
            return res.status(400).setHeader("Content-Type", "text/plain").end("webauthn required");
        
        const assertion: Assertion = {
            rawId: req.body.assertion.rawId ?? "",
            response: {
                authenticatorData: req.body.assertion.response.authenticatorData ?? "",
                clientDataJSON: req.body.assertion.response.clientDataJSON ?? "",
                signature: req.body.assertion.response.signature ?? ""
            }
        }

        const success = await WebAuthN.verifyAssertion(user, assertion, webauthn);
        if(!success)
            return res.status(403).end();
    }

    res.status(200).json({
        token: sign({ user_id: user.id, username: user.username }, "verySecureIKnow")
    });
});

AuthHandler.post("/login/resident", (req, res) => {
    if(!req.body.challenge || !req.body.response.userHandle)
        return res.status(400).end();

    const userId = req.body.response.userHandle as string;
    const user = DB.users.find(it => it.id === userId);
    if(!user)
        return res.status(400).end();
    
    const webauthn = DB.residentWebauthn[user.id];
    if(!webauthn)
        return res.status(400).end();

    const assertion: Assertion = {
        rawId: req.body.rawId ?? "",
        response: {
            authenticatorData: req.body.response.authenticatorData ?? "",
            clientDataJSON: req.body.response.clientDataJSON ?? "",
            signature: req.body.response.signature ?? ""
        }
    }

    WebAuthN.verifyAssertionResident(req.body.challenge as string, webauthn, assertion).then(success => {
        if(!success)
            return res.status(400).end();

        res.status(200).json({
            token: sign({ user_id: user.id, username: user.username }, "verySecureIKnow")
        });
    })
});

AuthHandler.post("/register", (req, res) => {
    const body = req.body;
    if(!hasAll(body, "username", "password"))
        return res.status(400).end();

    const user = DB.users.find(it => it.username === body.username);
    if(user)
        return res.status(400).end();
    
    // body has username and password so we can just spread it here 🥵
    DB.users.push({ id: generateUniqueId(), ...body });
    res.status(200).end();
})

export { AuthHandler };