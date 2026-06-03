import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "@/lib/authApi";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Token manquant");
      return;
    }
    verifyEmail(token)
      .then((res) => {
        setStatus("ok");
        setMessage(res.message || "Email vérifié");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Lien invalide ou expiré");
      });
  }, [params]);

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white border rounded-lg text-center">
      {status === "loading" && <p>Vérification en cours...</p>}
      {status === "ok" && (
        <>
          <h2 className="text-xl font-semibold text-green-700 mb-2">Email confirmé</h2>
          <p className="text-gray-600 mb-4">{message}</p>
          <Link to="/login" className="text-[#0A6ED1] hover:underline">
            Se connecter
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Échec</h2>
          <p className="text-gray-600">{message}</p>
        </>
      )}
    </div>
  );
}
