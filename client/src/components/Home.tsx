import { FC } from "react";
import { useStoreActions } from "../hooks/state";
import { useAuth } from "../hooks/useAuth";

const Home: FC = () => {
    const { username } = useAuth();

    const setToken = useStoreActions(store => store.auth.setToken);

    const logout = () => {
        setToken("");
    }

    return (
        <div>
            <span>Hi {username}</span>
            <button onClick={logout}>Logout</button>
        </div>
    );
}

export default Home;