import { useFormik } from "formik";
import { FC, useState } from "react";
import styled from "styled-components";
import { useStoreActions } from "../hooks/state";
import { http } from "../http";

type User = { username: string, password: string };

const Container = styled.div`
    display: flex;
    gap: 2rem;
    width: 100%;
    justify-content: center;
`

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    width: min(100%, 300px);

    form {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 2rem;
        align-items: stretch;
    }
`

const Login: FC = () => {
    const setToken = useStoreActions(store => store.auth.setToken);

    // very shitty state, ik
    const [ loginError, setLoginError ] = useState("");
    const [ registerError, setRegisterError ] = useState("");
    const [ registerDone, setRegisterDone ] = useState(false);

    const login = (user: User) => {
        http.post("/auth/login", { ...user }).then(req => req.data).then((data: { token: string }) => {
            setToken(data.token);
        }).catch(() => setLoginError("Login failed!"));
    }

    const register = (user: User) => {
        http.post("/auth/register", { ...user }).then(req => req.data).then((data: { token: string }) => {
            setRegisterDone(true);
            setRegisterError("");
        }).catch(() => {
            setRegisterError("Couldn't create account!")
            setRegisterDone(false);
        });
    }

    const loginFormik = useFormik<User>({
        initialValues: {
            username: "",
            password: ""
        },
        onSubmit: login
    });

    const registerFormik = useFormik<User>({
        initialValues: {
            username: "",
            password: ""
        },
        onSubmit: register
    })

    return (
        <Container>
            <FormContainer>
                <span style={{ color: "red" }}>{loginError}</span>
                <span>Login</span>
                <form onSubmit={loginFormik.handleSubmit}>
                    <input type="text" name="username" placeholder="Username" onChange={loginFormik.handleChange} />
                    <input type="password" name="password" placeholder="Password" onChange={loginFormik.handleChange} />
                    <button>Log in</button>
                </form>
            </FormContainer>
            <FormContainer>
                <span style={{ color: "red" }}>{registerError}</span>
                { registerDone && <span style={{ color: "lightgreen" }}>Account created</span> }
                <span>Create account</span>
                <form onSubmit={registerFormik.handleSubmit}>
                    <input type="text" name="username" placeholder="Username" onChange={registerFormik.handleChange} />
                    <input type="password" name="password" placeholder="Password" onChange={registerFormik.handleChange} />
                    <button>Create account</button>
                </form>
            </FormContainer>
        </Container>
    );
}

export default Login;