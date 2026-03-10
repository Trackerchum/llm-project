declare global {
	interface CookieListItem {
		name: string;
		value: string;
	}

	interface Window {
		cookieStore: CookieStore;
	}
}

export {};
