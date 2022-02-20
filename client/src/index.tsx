import { StoreProvider } from "easy-peasy";
import React from "react";
import ReactDOM from "react-dom";
import { createGlobalStyle } from "styled-components";

import App from "./components/App"
import { store } from "./store";

const GlobalStyle = createGlobalStyle`
    * {
        font-family: Roboto, Arial, sans-serif;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        background-color: #0a0d13;
    }

    span, p {
        color: white;
    }

    input {
        background-color: #16191f;
        padding: 1rem;
        border: none;
        outline: none;
        color: white;
    }
`

ReactDOM.render(
    <React.StrictMode>
        <GlobalStyle />
        <StoreProvider store={store}>
            <App />
        </StoreProvider>
    </React.StrictMode>,
    document.getElementById("root")
)