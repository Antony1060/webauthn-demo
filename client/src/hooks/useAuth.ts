import { decode } from "jsonwebtoken";
import { useStoreState } from "./state";

export const useAuth = (): { authenticated: boolean, username: string } => {
    const token = useStoreState(store => store.auth.token);

    const decoded = decode(token) ?? {};
    const username = typeof decoded === "object" ? decoded["username"] ?? "" : "";
    return { authenticated: !!token, username };
}