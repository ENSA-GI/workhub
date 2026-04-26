import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";

import "./styles/tailwind.css";
import "./styles/index.css";
import "./styles/theme.css";

import App from "./app/App.tsx";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
    throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY (Clerk publishable key)");
}

const rootElement = document.getElementById("root");
if (!rootElement) {
    throw new Error(
        "Erreur critique : Impossible de trouver <div id='root'> dans index.html."
    );
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ClerkProvider>
    </React.StrictMode>
);