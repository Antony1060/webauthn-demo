import { decode, encode } from "base64-arraybuffer";
import { Blob } from "buffer";
import { Fido2Lib, Fido2LibOptions } from "fido2-lib"
import { DB, User, UserWebauthn } from "../DB";
import { Logger } from "./logger";

const opts: Fido2LibOptions = {
    timeout: 30 * 1000,
    rpId: process.env.WEBAUTHN_RP_ID ?? "localhost",
    rpName: "antonys-webauthn-demo",
    rpIcon: "https://media.antony.red/logoTransparent.png",
    challengeSize: 128,
    attestation: "direct",
    cryptoParams: [-7, -257],
    authenticatorAttachment: "cross-platform",
    authenticatorUserVerification: "discouraged"
}

const fido2 = new Fido2Lib({ ...opts, authenticatorRequireResidentKey: false });
const fido2Resident = new Fido2Lib({ ...opts, authenticatorRequireResidentKey: true });

export type Attenstation = {
    rawId: string,
    response: {
        attestationObject: string,
        clientDataJSON: string
    }
}

export type Assertion = {
    rawId: string,
    response: {
        authenticatorData: string,
        clientDataJSON: string,
        signature: string,
        userHandle?: string
    }
}

const challenges: Record<string, string> = {};

// memory cleanup
setInterval(() => {
    Logger.info("Scheduled challange memory cleanup", Object.keys(challenges).length + " challanges");
    Object.keys(challenges).forEach(it => delete challenges[it]);
}, 10 * 60 * 1000);

export const WebAuthN = {
    attestate: async (user: User, resident = false) => {
        const options = await (resident ? fido2Resident : fido2).attestationOptions();
        options.user = { id: user.username, name: user.username, displayName: user.username };

        const encoded = { ...options, challenge: encode(options.challenge) }
        challenges[user.username] = encoded.challenge;

        return encoded;
    },

    verifyAttestation: async (user: User, attestation: Attenstation, resident = false): Promise<UserWebauthn> => {
        const result = await (resident ? fido2Resident : fido2).attestationResult({
            ...attestation,
            rawId: decode(attestation.rawId)
        }, {
            rpId: opts.rpId,
            challenge: challenges[user.username],
            origin: process.env.WEBAUTHN_ORIGIN ?? "http://localhost:3000",
            factor: "either"
        });

        return { credentialId: encode(result.clientData.get("rawId")), publicKey: result.authnrData.get("credentialPublicKeyPem") }
    },

    assert: async (user: User, auth: UserWebauthn) => {
        const options = await fido2.assertionOptions();

        const encoded = {
            ...options,
            challenge: encode(options.challenge),
            allowCredentials: [{
                type: "public-key",
                id: auth.credentialId,
                transports: ["usb", "ble", "nfc"]
            }]
        };
        challenges[user.username] = encoded.challenge;

        return encoded;
    },

    verifyAssertion: async (user: User, assertion: Assertion, auth: UserWebauthn): Promise<boolean> => {
        return fido2.assertionResult({
            ...assertion,
            rawId: decode(assertion.rawId),
            response: {
                ...assertion.response,
                authenticatorData: decode(assertion.response.authenticatorData)
            }
        }, {
            challenge: challenges[user.username],
            origin: process.env.WEBAUTHN_ORIGIN ?? "http://localhost:3000",
            factor: "either",
            publicKey: auth.publicKey,
            prevCounter: 0,
            userHandle: null
        }).then(() => true).catch(() => false);
    },

    assertResident: async () => {
        const options = await fido2Resident.assertionOptions();

        const encoded = {
            ...options,
            challenge: encode(options.challenge)
        };

        return encoded;
    },

    verifyAssertionResident: async (challenge: string, auth: UserWebauthn, assertion: Assertion): Promise<boolean> => {
        return fido2Resident.assertionResult({
            ...assertion,
            rawId: decode(assertion.rawId),
            response: {
                ...assertion.response,
                authenticatorData: decode(assertion.response.authenticatorData)
            }
        }, {
            challenge,
            origin: process.env.WEBAUTHN_ORIGIN ?? "http://localhost:3000",
            factor: "either",
            publicKey: auth.publicKey,
            prevCounter: 0,
            userHandle: null
        }).then(() => true).catch(() => false);
    }
}