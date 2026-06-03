import { useState } from "react";

interface LoginProps {
    onLoginSuccess: (token: string, user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8088/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                throw new Error("Invalid credentials");
            }

            const data = await res.json();
            onLoginSuccess(data.token, data.user);
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 420, margin: "40px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>Se connecter</h2>
            {error && <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                    <label style={{ display: "block", marginBottom: "5px" }}>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                    />
                </div>
                <div>
                    <label style={{ display: "block", marginBottom: "5px" }}>Mot de passe</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: "10px",
                        backgroundColor: "#0056b3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                >
                    {loading ? "Connexion..." : "Se connecter"}
                </button>
            </form>
        </div>
    );
}
