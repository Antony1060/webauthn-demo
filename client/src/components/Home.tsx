import { decode } from "base64-arraybuffer";
import { FC, useEffect, useState } from "react";
import styled from "styled-components";
import { useStoreActions, useStoreState } from "../hooks/state";
import { useAuth } from "../hooks/useAuth";
import { http } from "../http";
import { decodeAssertion, encodeAssertResponse, encodeAttestationResponse } from "../lib/webauthn";
import { Button } from "./elements/Button";
import FancySwitcher from "./elements/FancySwitcher";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    font-size: 1.4rem;
    text-align: center;
    max-width: 100%;
    padding: 2rem 1rem;
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
    max-width: calc(100%);
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
    
    pre, code {
        font-family: monospace;
    }

    span.warning {
        font-size: 1.3rem;
        text-align: center;
    }
`

const BoxContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
`

export type UserWebauthn = {
    publicKey: string,
    credentialId: string
}

const Home: FC = () => {
    const { username } = useAuth();

    const [ processing, setProcessing ] = useState(false);
    const [ slide, setSlide ] = useState<"resident" | "normal">("normal");
    const [ credentials, setCredentials ] = useState<UserWebauthn | undefined>();
    const [ residentCredentials, setResidentCredentials ] = useState<UserWebauthn | undefined>();

    const setToken = useStoreActions(store => store.auth.setToken);

    const logout = () => {
        setToken("");
    }

    const fetchCredentials = async () =>
        Promise.all([
            http.get("/webauthn").then(res => res.data).then((data: UserWebauthn) => {
                setCredentials(data);
            }).catch(() => setCredentials(undefined)),
            http.get("/webauthn/resident").then(res => res.data).then((data: UserWebauthn) => {
                setResidentCredentials(data);
            }).catch(() => setResidentCredentials(undefined))
        ])

    const setUp = (resident: boolean) => {
        setProcessing(true);
        (async () => {
            const attestation = await http.get(resident ? "/webauthn/resident/attestate/begin" : "/webauthn/attestate/begin").then(res => res.data as PublicKeyCredentialCreationOptions);
            attestation.challenge = decode(attestation.challenge as unknown as string);
            attestation.user.id = decode(attestation.user.id as unknown as string);

            const credential = await navigator.credentials.create({ publicKey: attestation });
            if(!credential) {
                // TODO: display some error
                return;
            }

            await http.post(resident ? "/webauthn/resident/attestate/end" : "/webauthn/attestate/end", encodeAttestationResponse(credential as PublicKeyCredential)).then(res => res.data).then((data: UserWebauthn) => {
                resident ? setResidentCredentials(data) : setCredentials(data);
            });
        })().finally(() => setProcessing(false));
    }

    const remove = (resident: boolean) => {
        setProcessing(true);
        (async () => {
            const rawAssertion = await http.get(resident ? "/webauthn/resident/assert/begin" : "/webauthn/assert/begin?username=" + username).then(res => res.data as PublicKeyCredentialRequestOptions);
            const assertion = decodeAssertion(rawAssertion);
            const credential = await navigator.credentials.get({ publicKey: assertion });
            if(!credential) {
                // TODO: display some error
                return;
            }

            await http.post(resident ?
                    "/webauthn/resident/assert/end-remove" :
                    "/webauthn/assert/end-remove", { challenge: rawAssertion.challenge, ...encodeAssertResponse(credential as PublicKeyCredential) }
                )
                .then(() => fetchCredentials())
        })().finally(() => setProcessing(false));
    }

    useEffect(() => {
        setProcessing(true)
        fetchCredentials().finally(() => setProcessing(false));
    }, []);

    return (
        <Container>
            <span>Hi {username}</span>
            <CredentialsContainer>
                <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <FancySwitcher options={["normal", "resident"]} onChange={setSlide} />
                </div>
                {slide === "normal" ?
                    !credentials ? <span className="warning">WebAuthN not set up</span> :
                    <>
                        <BoxContainer>
                            <span>Credential ID</span>
                            <pre>{credentials.credentialId}</pre>
                        </BoxContainer>

                        <BoxContainer>
                            <span>Public Key</span>
                            <pre>
                                <code>{credentials.publicKey}</code>
                            </pre>
                        </BoxContainer>
                    </>
                :
                    !residentCredentials ? <span className="warning">Resident keys not set up</span> :
                    <>
                        <BoxContainer>
                            <span>Credential ID</span>
                            <pre>{residentCredentials.credentialId}</pre>
                        </BoxContainer>

                        <BoxContainer>
                            <span>Public Key</span>
                            <pre>
                                <code>{residentCredentials.publicKey}</code>
                            </pre>
                        </BoxContainer>
                    </>
                }
            </CredentialsContainer>
            <ButtonContainer>
                <Button style={{ backgroundColor: "#c44d4d" }} onClick={logout}>Logout</Button>
                <Button onClick={credentials ? () => remove(false) : () => setUp(false)} disabled={processing}>{ credentials ? "Remove WebAuthN" : "Set up WebAuthN" }</Button>
                <Button onClick={residentCredentials ? () => remove(true) : () => setUp(true)} disabled={processing}>{ residentCredentials ? "Remove Passwordless" : "Set up Passwordless"}</Button>
            </ButtonContainer>
        </Container>
    );
}

export default Home;