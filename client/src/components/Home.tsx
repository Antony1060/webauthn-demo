import { decode } from "base64-arraybuffer";
import { FC, useEffect, useState } from "react";
import styled from "styled-components";
import { useStoreActions, useStoreState } from "../hooks/state";
import { useAuth } from "../hooks/useAuth";
import { http } from "../http";
import { decodeAssertion, encodeAssertResponse, encodeAttestationResponse } from "../lib/webauthn";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    font-size: 1.4rem;
    text-align: center;
`

const ButtonContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
`

const CredentialsContainer = styled.div`
    display: flex;
    padding: 1rem;
    flex-direction: column;
    min-width: calc(100% - 1rem);
    width: 600px;
    text-align: start;
    gap: 2rem;
    font-size: 1.1rem;

    pre {
        background-color: #0d1117;
        color: white;
        padding: 1rem;
        border: 1px solid white;
        overflow: auto;
        font-size: 1rem;
    }
    
    div {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }
`

export type UserWebauthn = {
    publicKey: string,
    credentialId: string
}

const Home: FC = () => {
    const { username } = useAuth();

    const [ processing, setProcessing ] = useState(false);
    const [ credentials, setCredentials ] = useState<UserWebauthn | undefined>();

    const setToken = useStoreActions(store => store.auth.setToken);

    const logout = () => {
        setToken("");
    }

    const fetchCredentials = async () =>
        http.get("/webauthn").then(res => res.data).then((data: UserWebauthn)  => {
            setCredentials(data);
        }).catch(() => setCredentials(undefined))

    const setUp = () => {
        setProcessing(true);
        (async () => {
            const attestation = await http.get("/webauthn/attestate/begin").then(res => res.data as PublicKeyCredentialCreationOptions);
            attestation.challenge = decode(attestation.challenge as unknown as string);
            attestation.user.id = decode(attestation.user.id as unknown as string);

            const credential = await navigator.credentials.create({ publicKey: attestation });
            if(!credential) {
                // TODO: display some error
                return;
            }

            await http.post("/webauthn/attestate/end", encodeAttestationResponse(credential as PublicKeyCredential)).then(res => res.data).then((data: UserWebauthn) => {
                setCredentials(data);
            });
        })().finally(() => setProcessing(false));
    }

    const remove = () => {
        setProcessing(true);
        (async () => {
            const rawAssertion = await http.get("/webauthn/assert/begin?username=" + username).then(res => res.data as PublicKeyCredentialRequestOptions);
            const assertion = decodeAssertion(rawAssertion);
            const credential = await navigator.credentials.get({ publicKey: assertion });
            if(!credential) {
                // TODO: display some error
                return;
            }

            await http.post("/webauthn/assert/end-remove", encodeAssertResponse(credential as PublicKeyCredential)).then(() => fetchCredentials())
        })().finally(() => setProcessing(false));
    }

    useEffect(() => {
        setProcessing(true)
        fetchCredentials().finally(() => setProcessing(false));
    }, []);

    return (
        <Container>
            <span>Hi {username}</span>
            {credentials ? 
                <CredentialsContainer>
                    <div>
                        <span>Credential ID</span>
                        <pre>{credentials.credentialId}</pre>
                    </div>

                    <div>
                        <span>Public Key</span>
                        <pre>
                            <code>{credentials.publicKey}</code>
                        </pre>
                    </div>
                </CredentialsContainer>
            : <span>WebAuthN not set up</span>}
            <ButtonContainer>
                <button style={{ backgroundColor: "#c44d4d" }} onClick={logout}>Logout</button>
                <button onClick={credentials ? remove : setUp} disabled={processing}>{ credentials ? "Remove WebAuthN" : "Set up WebAuthN" }</button>
                <button disabled>Set up Passwordless</button>
            </ButtonContainer>
        </Container>
    );
}

export default Home;