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
    padding: 1rem;
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