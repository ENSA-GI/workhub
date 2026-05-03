import { useAuth } from "@clerk/clerk-react";

export function useApi() {
    const { getToken } = useAuth();

    return async function apiFetch(path: string, init: RequestInit = {}) {
        const token = await getToken();

        const headers = new Headers(init.headers);
        if (token) headers.set("Authorization", `Bearer ${token}`);
        headers.set("Accept", "application/json");

        if (init.body && !headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }

        const res = await fetch(path, { ...init, headers });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`API ${res.status} on ${path}: ${txt}`);
        }

        const ct = res.headers.get("content-type") || "";
        // @ts-ignore
        return ct.includes("application/json") ? res.json() : res.text();
    };
}