import { FC } from "react";
import styled from "styled-components";
import { useStoreActions } from "../hooks/state";
import { useAuth } from "../hooks/useAuth";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    font-size: 1.4rem;
`

const Home: FC = () => {
    const { username } = useAuth();

    const setToken = useStoreActions(store => store.auth.setToken);

    const logout = () => {
        setToken("");
    }

    return (
        <Container>
            <span>Hi {username}</span>
            <button onClick={logout}>Logout</button>
        </Container>
    );
}

export default Home;