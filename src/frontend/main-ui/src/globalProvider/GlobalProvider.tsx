import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { User } from "../models/user";
import { userCookieKey } from "../helpers/constants";
import { Notification } from "../types/notification";

interface AuthState {
	user: User | null;
	setUser: (user: AuthState["user"]) => Promise<void>;
	getUser: () => AuthState["user"];
	logoutUser: () => Promise<void>;
}

interface NotificationsState {
	notifications: Notification[];
	addNotification: (notification: Notification) => void;
	removeNotification: (notificationId: string) => void;
}

interface GlobalState {
	authState: AuthState;
	notificationsState: NotificationsState;
}

const globalState = createContext<GlobalState | null>(null);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
	const [user, setUserState] = useState<AuthState["user"]>(null);
	const [notifications, setNotifications] = useState<NotificationsState["notifications"]>([]);

	useEffect(() => {
		window.cookieStore.get(userCookieKey).then((cookie: CookieListItem | null) => {
			if (cookie?.name === userCookieKey && cookie.value) {
				setUserState(JSON.parse(cookie.value));
			}
		});
	}, []);

	const setUser = async (user: AuthState["user"]) => {
		await window.cookieStore.set(userCookieKey, JSON.stringify(user));
		setUserState(user);
	};

	const logoutUser = async () => {
		await window.cookieStore.delete(userCookieKey);
		setUserState(null);
	};

	const addNotification = useCallback((notification: Notification) => {
		setNotifications((prev) => [...prev, notification]);
	}, []);

	const removeNotification = useCallback((notificationId: string) => {
		setNotifications((prev) => {
			const notificationIndex = prev.findIndex((notification) => notificationId === notification.id);
			if (notificationIndex !== -1) {
				return [...prev.slice(0, notificationIndex), ...prev.slice(notificationIndex + 1)];
			}
			return prev;
		});
	}, []);

	const value = useMemo(
		() => ({
			authState: {
				user,
				setUser,
				getUser: () => user,
				logoutUser,
			},
			notificationsState: {
				notifications,
				addNotification,
				removeNotification,
			},
		}),
		[user, notifications, addNotification, removeNotification],
	);

	return <globalState.Provider value={value}>{children}</globalState.Provider>;
}

export function useAuth(): AuthState {
	const ctx = useContext(globalState);
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
	return ctx.authState;
}

export function useNotifications(): NotificationsState {
	const ctx = useContext(globalState);
	if (!ctx) throw new Error("useNotifications must be used inside AuthProvider");
	return ctx.notificationsState;
}
