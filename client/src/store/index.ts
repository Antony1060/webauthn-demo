import { Action, action, createStore, persist } from "easy-peasy";

export type AuthStore = {
    token: string,
    setToken: Action<AuthStore, string>
}

const auth = persist<AuthStore>({
    token: "",
    setToken: action((state, token) => { state.token = token; })
}, { storage: "localStorage" });


export const store = createStore({ auth });