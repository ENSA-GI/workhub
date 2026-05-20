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

// ClerkProvider ne doit pas essayer d'utiliser useNavigate() directement
// au moment du render. On utilise la config simple.
ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <ClerkProvider
                publishableKey={clerkPubKey}
                afterSignOutUrl="/"
            >
                <QueryClientProvider client={queryClient}>
                    <App />
                </QueryClientProvider>
            </ClerkProvider>
        </BrowserRouter>
    </React.StrictMode>
);