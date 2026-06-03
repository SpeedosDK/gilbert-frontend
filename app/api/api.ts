// @/app/api/api.ts

const PUBLIC_PATHS = ["/", "/products", "/terms", "/about", "/contact"];

// I browseren bruger vi RELATIVE URL'er, så alle /api-kald går gennem
// Next.js' rewrite-proxy (se next.config.ts). Det gør requests same-origin
// (frontend-domænet), så:
//  - cookies bliver førsteparts (middleware kan læse dem, browsere blokerer ikke)
//  - vi undgår CORS helt
// Ved server-side rendering (ingen window) kalder vi backend direkte.
const SERVER_API_URL =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000";

function getBaseUrl() {
    return typeof window !== "undefined" ? "" : SERVER_API_URL;
}

export async function api(path: string, options: RequestInit = {}) {
    const isClient = typeof window !== "undefined";
    const headers = new Headers(options.headers);

    if (!(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    const API_URL = getBaseUrl();
    const fullUrl = `${API_URL}${path}`;

    let res = await fetch(fullUrl, {
        ...options,
        credentials: "include",
        headers
    });

    const isLogout = path.includes("/auth/logout");
    const isRefresh = path.includes("/auth/refresh");

    if (res.status === 401 && isClient && !isLogout && !isRefresh) {
        console.warn("401 Unauthorized – forsøger refresh…");

        const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
            method: "POST",
            credentials: "include"
        });

        if (refreshRes.ok) {
            res = await fetch(fullUrl, {
                ...options,
                credentials: "include",
                headers
            });

            if (res.status === 401) handleFinalLogout();
        } else {
            handleFinalLogout();
        }
    }

    return res;
}

function handleFinalLogout() {
    if (typeof window !== "undefined") {
        // 1. Ryd altid lokal data, så din UI ved at du er logget ud
        localStorage.removeItem("user");

        const currentPath = window.location.pathname;

        // 2. Tjek om den nuværende side er i vores "offentlige" liste
        // Vi tjekker om stien starter med en af de offentlige (så /products/123 også er dækket)
        const isPublicPage = PUBLIC_PATHS.some(path =>
            currentPath === path || currentPath.startsWith(path + "/")
        );

        // 3. Omdiriger KUN hvis vi ikke er på en offentlig side
        if (!isPublicPage && !currentPath.includes("/login")) {
            window.location.href = "/login?reason=session_expired";
        } else {
            // Hvis vi er på en offentlig side, trigger vi bare en "refresh" af sitet
            // eller lader React staten opdatere sig, så 'user' bliver null.
            console.log("User session expired, but staying on public page.");
        }
    }
}