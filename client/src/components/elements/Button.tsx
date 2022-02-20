import styled from "styled-components";

export const Button = styled.button`
    background-color: #16191f;
    padding: 1rem;
    border: none;
    outline: none;
    color: white;
    font-size: 1.1rem;
    transition: 200ms linear;
    cursor: pointer;

    &:hover, &[disabled] {
        background-color: #272b33;
        transition: 200ms linear;
    }

    &[disabled] {
        cursor: default;
    }
`