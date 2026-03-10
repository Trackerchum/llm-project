import { createContext, useContext, useEffect, useState } from "react";
import { User } from "../models/user";
import { userCookieKey } from "../helpers/constants";

interface AuthState {
    user: User | null;
    setUser: (user: AuthState["user"]) => Promise<void>;
    getUser: () => AuthState["user"];
    logoutUser: () => Promise<void>;
};

interface GlobalState {
    authState: AuthState
}

const globalState = createContext<GlobalState | null>(null);

export function GlobalProvider({ children }: { children: React.ReactNode }) {

    const [user, setUserState] = useState<AuthState["user"]>(null);

    useEffect(() => {
        window.cookieStore.get(userCookieKey).then((cookie: CookieListItem | null) => {
            if (cookie?.name === userCookieKey && cookie.value) {
                setUserState(JSON.parse(cookie.value));
            }
        })
    }, []);

    const setUser = async (user: AuthState["user"]) => {
        await window.cookieStore.set(userCookieKey, JSON.stringify(user));
        setUserState(user);
    }

    const logoutUser = async () => {
        await window.cookieStore.delete(userCookieKey);
        setUserState(null);
    }

    return (
        <globalState.Provider value={{
            authState: {
                user,
                setUser,
                getUser: () => user,
                logoutUser
            }
        }}>
            {children}
        </globalState.Provider>
    );
}

export function useAuth(): AuthState {
    const ctx = useContext(globalState);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx.authState;
}