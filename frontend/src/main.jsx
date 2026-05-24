import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./app/App";

import "./styles/index.css";
import "./styles/tailwind.css";
import "./styles/theme.css";

const clerkPubKey =
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
    "pk_test_ZmVhc2libGUtdmVydmV0LTkuY2xlcmsuYWNjb3VudHMuZGV2JA";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: 1, refetchOnWindowFocus: false },
    },
});

function ClerkWithRouter({ children }) {
    const navigate = useNavigate();
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
            <ClerkWithRouter>
                <QueryClientProvider client={queryClient}>
                    <App />
                </QueryClientProvider>
            </ClerkWithRouter>
        </BrowserRouter>
    </React.StrictMode>
);
