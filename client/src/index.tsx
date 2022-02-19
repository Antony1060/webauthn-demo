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

    button, input {
        background-color: #16191f;
        padding: 1rem;
        border: none;
        outline: none;
        color: white;
    }

    button {
        font-size: 1.1rem;
        transition: 200ms linear;

        &:hover, &[disabled] {
            background-color: #272b33;
            transition: 200ms linear;
        }
    }
`

console.log(process.env.BASE_URL)

ReactDOM.render(
    <React.StrictMode>
        <GlobalStyle />
        <StoreProvider store={store}>
            <App />
        </StoreProvider>
    </React.StrictMode>,
    document.getElementById("root")
)