import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
    height: 40px;
    background-color: #272b33;
    border-radius: 20px;
    padding: 6px;
    display: flex;
    gap: 6px;
    position: relative;
`

const FancyButton = styled.button`
    padding: 0 10px;
    border: none;
    font-size: 1rem;
    width: fit-content;
    background-color: unset;
    color: white;
    cursor: pointer;
    z-index: 2;
`

const Cover = styled.div<{ width: number, position: "left" | "right" }>`
    position: absolute;
    top: 4px;
    left: 4px;
    transform: translateX(0);
    ${({ position }) => position === "right" ? `
        left: calc(100% - 4px);
        transform: translateX(-100%);
    `: ""};
    height: 32px;
    border-radius: 16px;
    background-color: #16191f;
    width: ${({ width }) => width}px;
    transition: 150ms ease-in;
`

const FancySwitcher = <T extends string>({ options, onChange }: { options: [T, T], onChange: (curr: T) => void }) => {
    const [ opt1, opt2 ] = options;

    const [ selected, setSelected ] = useState<T>(opt1);

    const [ coverWidth, setCoverWidth ] = useState(0)
    const [ coverPosition, setCoverPosition ] = useState<"left" | "right">("left");

    const opt1Ref = useRef<HTMLButtonElement | null>(null);
    const opt2Ref = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        const target = selected === opt1 ? opt1Ref : opt2Ref;
        if(!target.current) return;

        setCoverWidth(target.current.clientWidth + 5);
        setCoverPosition(selected === opt1 ? "left" : "right");

        onChange(selected);
    }, [selected])

    return (
        <Container>
            <Cover width={coverWidth} position={coverPosition} />
            <FancyButton ref={opt1Ref} onClick={() => setSelected(opt1)}>{opt1}</FancyButton>
            <FancyButton ref={opt2Ref} onClick={() => setSelected(opt2)}>{opt2}</FancyButton>
        </Container>
    )
}

export default FancySwitcher;