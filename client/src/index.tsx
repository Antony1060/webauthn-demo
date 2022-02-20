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

        ::-webkit-scrollbar {
            background-color: #151a22;
        }

        ::-webkit-scrollbar-thumb {
            background-color: #272b33;
        }
    }

    html, body {
        height: 100%;
    }

    #root {
        min-height: 100%;
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