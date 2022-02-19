import { Router } from "express";
import { DB } from "../DB";
import { Assertion, Attenstation, WebAuthN } from "../lib/WebAuthN";
import { AuthenticatedRequest, useAuth } from "../middleware/useAuth";

const WebAuthnHandler = Router()

WebAuthnHandler.get("/", useAuth, (req: AuthenticatedRequest, res) => {
    const webauthn = DB.userWebauthn[req.user!.username];
    if(!webauthn)
        return res.status(404).end();

    res.json(webauthn);
})

WebAuthnHandler.get("/attestate/begin", useAuth, (req: AuthenticatedRequest, res) => {
    WebAuthN.attestate(req.user!).then(it => res.json(it)).catch(() => res.status(400).end());
});

WebAuthnHandler.post("/attestate/end", useAuth, (req: AuthenticatedRequest, res) => {
    const attestation: Attenstation = {
        rawId: req.body.rawId ?? "",
        response: {
            attestationObject: req.body.response.attestationObject ?? "",
            clientDataJSON: req.body.response.clientDataJSON ?? ""
        }
    }

    const user = req.user!;
    WebAuthN.verifyAttestation(user, attestation).then(it => {
        DB.userWebauthn[user.username] = it;
        res.json(it);
    }).catch((it) => res.status(400).end(it.message));
})

WebAuthnHandler.get("/assert/begin", (req, res) => {
    const query = req.query;
    if(!query.username)
        return res.status(400).end();
    
    const user = DB.users.find(it => it.username === query.username as string);
    if(!user)
        return res.status(400).end();

    const webauthn = DB.userWebauthn[user.username];
    if(!webauthn)
        return res.status(400).end();


    WebAuthN.assert(user, webauthn).then(it => res.json(it)).catch(() => res.status(400).end());
})

WebAuthnHandler.post("/assert/end-remove", useAuth, (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    const webauthn = DB.userWebauthn[user.username];
    if(!webauthn)
        return res.status(400).end()

    const assertion: Assertion = {
        rawId: req.body.rawId ?? "",
        response: {
            authenticatorData: req.body.response.authenticatorData ?? "",
            clientDataJSON: req.body.response.clientDataJSON ?? "",
            signature: req.body.response.signature ?? ""
        }
    }

    WebAuthN.verifyAssertion(user, assertion, webauthn).then(success => {
        if(!success)
            return res.status(400).end();

        delete DB.userWebauthn[user.username];
        res.status(200).end();
    })
})

export { WebAuthnHandler }