import { FC } from "react";
import Home from "./Home";
import { useAuth } from "../hooks/useAuth";
import Login from "./Login";
import styled from "styled-components";

const Container = styled.div`
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;

    @media (max-height: 600px) {
        align-items: flex-start;
    }

    @media (max-width: 800px) {
        align-items: flex-start;
    }
`

const App: FC = () => {
    const { authenticated } = useAuth();

    return (
        <Container>
            {authenticated ? <Home /> : <Login />}
        </Container>
    );
}

export default App;