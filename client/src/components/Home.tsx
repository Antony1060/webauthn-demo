import { decode } from "base64-arraybuffer";
import { FC, useEffect, useState } from "react";
import styled from "styled-components";
import { useStoreActions, useStoreState } from "../hooks/state";
import { useAuth } from "../hooks/useAuth";
import { http } from "../http";
import { encodeAttestationResponse } from "../lib/webauthn";

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

export type UserWebauthn = {
    publicKey: string,
    credentialId: string
}

const Home: FC = () => {
    const { username } = useAuth();

    const [ processing, setProcessing ] = useState(false);
    const [ credentialId, setCredentialId ] = useState("");

    const setToken = useStoreActions(store => store.auth.setToken);

    const logout = () => {
        setToken("");
    }

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

            await http.post("/webauthn/attestate/end", encodeAttestationResponse(credential as PublicKeyCredential)).then(res => res.data).then(({ credentialId }: UserWebauthn) => {
                setCredentialId(credentialId);
            });
        })().finally(() => setProcessing(false));
    }

    useEffect(() => {
        http.get("/webauthn").then(res => res.data).then(({ credentialId }: UserWebauthn)  => {
            setCredentialId(credentialId);
        }).catch(() => setCredentialId("WebAuthN not set up"));
    }, []);

    return (
        <Container>
            <span>Hi {username}</span>
            <span>{credentialId}</span>
            <ButtonContainer>
                <button style={{ backgroundColor: "#c44d4d" }} onClick={logout}>Logout</button>
                <button onClick={setUp} disabled={processing}>Set up WebAuthN</button>
                <button disabled>Set up Passwordless</button>
            </ButtonContainer>
        </Container>
    );
}

export default Home;