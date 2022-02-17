import { useFormik } from "formik";
import { FC, useState } from "react";
import styled from "styled-components";
import { useStoreActions } from "../hooks/state";
import { http } from "../http";

type User = { username: string, password: string };

const Container = styled.div`
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

    const [ error, setError ] = useState("");

    const login = (user: User) => {
        http.post("/auth/login").then(req => req.data).then((data: { token: string }) => {
            setToken(data.token);
        }).catch(() => setError("Login failed!"));
    }

    const formik = useFormik<User>({
        initialValues: {
            username: "",
            password: ""
        },
        onSubmit: login
    });

    return (
        <Container>
            <span style={{ color: "red" }}>{error}</span>
            <form onSubmit={formik.handleSubmit}>
                <input type="text" name="username" placeholder="Username" />
                <input type="password" name="password" placeholder="Password" />
                <button>Log in</button>
            </form>
        </Container>
    );
}

export default Login;