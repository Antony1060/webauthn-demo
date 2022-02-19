import { AxiosError } from "axios";
import { useFormik } from "formik";
import { FC, useState } from "react";
import styled from "styled-components";
import { useStoreActions } from "../hooks/state";
import { http } from "../http";
import { decodeAssertion, encodeAssertResponse } from "../lib/webauthn";

type User = { username: string, password: string };

const Contianer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    justify-content: center;
    text-align: center;
`

const ContentContainer = styled.div`
    display: flex;
    gap: 2rem;
    justify-content: center;
    align-items: stretch;
    border: 1px dashed #ffffffaa;
    padding: 2rem;

    @media (max-width: 800px) {
        flex-direction: column;
        align-items: center;
        justify-content: stretch;
    }
`

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    width: 300px;

    form {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 2rem;
        align-items: stretch;
    }
`

const Divider = styled.div`
    background-color: #ffffffaa;
    width: 1px;
    margin: -1rem 0;

    @media (max-width: 800px) {
        height: 1px;
        margin: 0;
        width: calc(100% + 2rem);
    }
`

type Status = {
    type: "success" | "error",
    message: string
}

const Login: FC = () => {
    const setToken = useStoreActions(store => store.auth.setToken);

    const [ processing, setProcessing ] = useState(false);
    const [ status, setStatus ] = useState<Status | undefined>();

    const formikSubmitWrapper = (fn: (user: User) => Promise<void>) => {
        return (user: User) => {
            setProcessing(true);
            fn(user).finally(() => setProcessing(false));
        }
    }

    const login = async (user: User) => {
        const res: AxiosError | undefined = await http.post("/auth/login", { ...user })
            .then(req => req.data).then((data: { token: string }) => {
                setToken(data.token);
            }).catch(err => err);

        if(!res || res.response?.data !== "webauthn required")
            return setStatus({ type: "error", message: "Login Failed" });

        const rawAssertion = await http.get("/webauthn/assert/begin?username=" + user.username).then(res => res.data as PublicKeyCredentialRequestOptions);
        const assertion = decodeAssertion(rawAssertion);
        const credential = await navigator.credentials.get({ publicKey: assertion });
        if(!credential)
            return setStatus({ type: "error", message: "Login failed" });

        await http.post("/auth/login", { ...user, assertion: encodeAssertResponse(credential as PublicKeyCredential)})
                .then(res => res.data)
                .then((data: { token: string }) => {
                    setToken(data.token);
                })
                .catch(() => setStatus({ type: "error", message: "Login failed" }));
    }

    const register = (user: User) =>
        http.post("/auth/register", { ...user }).then(req => req.data).then(() => {
            setStatus({ type: "success", message: "Account Created" });
        }).catch(() => {
            setStatus({ type: "error", message: "Couldn't create account" });
        });

    const loginFormik = useFormik<User>({
        initialValues: {
            username: "",
            password: ""
        },
        onSubmit: formikSubmitWrapper(login)
    });

    const registerFormik = useFormik<User>({
        initialValues: {
            username: "",
            password: ""
        },
        onSubmit: formikSubmitWrapper(register)
    })

    return (
        <Contianer>
            <span style={{ height: "1rem", color: status ? status.type === "error" ? "#ff7d7d" : "lightgreen" : "unset" }}>{processing ? undefined : status?.message}</span>
            <ContentContainer>
                <FormContainer>
                    <span>Login</span>
                    <form onSubmit={loginFormik.handleSubmit}>
                        <input type="text" name="username" placeholder="Username" onChange={loginFormik.handleChange} />
                        <input type="password" name="password" placeholder="Password" onChange={loginFormik.handleChange} />
                        <button disabled={processing}>Log in</button>
                    </form>
                </FormContainer>
                <Divider></Divider>
                <FormContainer>
                    <span>Create account</span>
                    <form onSubmit={registerFormik.handleSubmit}>
                        <input type="text" name="username" placeholder="Username" onChange={registerFormik.handleChange} />
                        <input type="password" name="password" placeholder="Password" onChange={registerFormik.handleChange} />
                        <button disabled={processing}>Create account</button>
                    </form>
                </FormContainer>
            </ContentContainer>
        </Contianer>
    );
}

export default Login;