export function useApi() {
    return async function apiFetch(path: string, init: RequestInit = {}) {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8888";
        const url = path.startsWith("http") ? path : `${apiBaseUrl}${path}`;
        const token = localStorage.getItem("workhub.token");

        const headers = new Headers(init.headers);
        if (token) headers.set("Authorization", `Bearer ${token}`);
        headers.set("Accept", "application/json");

        if (init.body && !headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }

        const res = await fetch(url, { ...init, headers });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`API ${res.status} on ${path}: ${txt}`);
        }

        if (res.status === 204) {
            return undefined;
        }

        const ct = res.headers.get("content-type") || "";
        const text = await res.text();
        if (!text) {
            return undefined;
        }

        return ct.includes("application/json") ? JSON.parse(text) : text;
    };
}
