import { createContext, useContext, useState } from "react";
import { User } from "../models/user";
import { userCookieKey } from "../helpers/constants";

interface AuthState {
    user: User | null;
    setUser: (user: AuthState["user"]) => void;
    getUser: () => AuthState["user"];
    logoutUser: () => void;
};

interface GlobalState {
    authState: AuthState
}

const GlobalState = createContext<GlobalState | null>(null);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<AuthState["user"]>(null);

    const setUser = (user: AuthState["user"]) => {
        window.cookieStore.set(userCookieKey, JSON.stringify(user));
        setUserState(user);
    }

    const logoutUser = () => {
        window.cookieStore.delete(userCookieKey);
        setUserState(null);
    }

    return (
        <GlobalState.Provider value={{
            authState: {
                user,
                setUser,
                getUser: () => user,
                logoutUser
            }
        }}>
            {children}
        </GlobalState.Provider>
    );
}

export function useAuth(): AuthState {
    const ctx = useContext(GlobalState);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx.authState;
}