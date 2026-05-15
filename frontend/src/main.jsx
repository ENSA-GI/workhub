import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./app/App";

// garde uniquement les CSS qui existent réellement chez toi
import "./styles/index.css";
import "./styles/tailwind.css";
import "./styles/theme.css";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: 1, refetchOnWindowFocus: false },
    },
});

// IMPORTANT: Clerk doit être rendu *dans* le Router
function ClerkProviderWithRouter({ children }) {
    const navigate = useNavigate();

    // Ces props existent dans @clerk/clerk-react (compat React Router)
    // et évitent les soucis de typage que tu as eu en TS.
    return (
        <ClerkProvider
            publishableKey={clerkPubKey}
            routerPush={(to) => navigate(to)}
            routerReplace={(to) => navigate(to, { replace: true })}
            afterSignOutUrl="/"
        >
            {children}
        </ClerkProvider>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <ClerkProviderWithRouter>
                <QueryClientProvider client={queryClient}>
                    <App />
                </QueryClientProvider>
            </ClerkProviderWithRouter>
        </BrowserRouter>
    </React.StrictMode>
);