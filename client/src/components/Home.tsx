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

const ButtonContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
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
            <ButtonContainer>
                <button style={{ backgroundColor: "#c44d4d" }} onClick={logout}>Logout</button>
                <button>Set up WebauthN</button>
                <button disabled>Set up Passwordless</button>
            </ButtonContainer>
        </Container>
    );
}

export default Home;