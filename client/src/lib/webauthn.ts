import { decode, encode } from "base64-arraybuffer";

export type TransmittablePublicKeyCredential = Omit<PublicKeyCredential, "rawId" | "response"> & { rawId: string | ArrayBuffer, response: { attestationObject: string | ArrayBuffer, clientDataJSON: string | ArrayBuffer } };
export type TransmittableAssertCredential = Omit<PublicKeyCredential, "rawId" | "response"> & { rawId: string | ArrayBuffer, response: { authenticatorData: string | ArrayBuffer, clientDataJSON: string | ArrayBuffer, signature: string | ArrayBuffer } };

export const encodeAttestationResponse = (credential: PublicKeyCredential): TransmittablePublicKeyCredential => {
    return {
        ...credential,
        id: credential.id,
        rawId: encode(credential.rawId),
        response: {
            attestationObject: encode((credential.response as { clientDataJSON: ArrayBuffer, attestationObject: ArrayBuffer }).attestationObject),
            clientDataJSON: encode(credential.response.clientDataJSON)
        },
        type: credential.type
    };
};

export const encodeAssertResponse = (credential: PublicKeyCredential): TransmittableAssertCredential => {
    return {
        ...credential,
        id: credential.id,
        rawId: encode(credential.rawId),
        response: {
            authenticatorData: encode((credential.response as { clientDataJSON: ArrayBuffer, authenticatorData: ArrayBuffer }).authenticatorData),
            clientDataJSON: encode(credential.response.clientDataJSON),
            signature: encode((credential.response as { clientDataJSON: ArrayBuffer, signature: ArrayBuffer }).signature)
        },
        type: credential.type
    };
};

export const decodeAssertion = (assertion: PublicKeyCredentialRequestOptions) => {
    const modified = { ...assertion, challenge: decode(assertion.challenge as unknown as string) };
    if(modified.allowCredentials)
        for(const i in modified.allowCredentials)
            modified.allowCredentials[i] = {
                ...modified.allowCredentials[i],
                id: decode(modified.allowCredentials[i].id as any as string)
            };
    return modified;
};