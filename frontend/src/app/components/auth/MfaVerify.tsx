import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { identityApi, saveAuthSession } from "@/lib/identityApi";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import logo from '@/imports/Capture_d_écran_2026-04-20_183125-removebg-preview.png';

interface MfaVerifyProps {
  mfaSessionToken: string;
  onSuccess: (token: string) => void;
  onCancel: () => void;
}

export default function MfaVerify({ mfaSessionToken, onSuccess, onCancel }: MfaVerifyProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await identityApi.verifyMfa(mfaSessionToken, code);
      if (!data.token) throw new Error("Verification failed");
      saveAuthSession(data);
      onSuccess(data.token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Code invalide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0F172A] flex flex-col items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-blob" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-blob animation-delay-4000" />
      
      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-8 left-8">
        <Link to="/" className="flex items-center"><img src={logo} alt="WorkHub" className="h-12 invert brightness-0" /></Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-10 relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </motion.div>

          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-2xl font-bold text-white mb-2">
            Vérification MFA
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-blue-100/70 text-sm mb-8">
            Entrez le code à 6 chiffres de votre application d'authentification
          </motion.p>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-red-500/20 border border-red-500/30 text-red-200 text-sm rounded-xl backdrop-blur-md text-left">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                required
                autoFocus
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-center text-3xl tracking-[1em] font-mono backdrop-blur-sm shadow-inner"
                placeholder="------"
              />
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              type="submit"
              disabled={loading || code.length !== 6}
              className="group relative w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center justify-center space-x-2">
                <span>{loading ? "Vérification..." : "Vérifier"}</span>
                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </span>
            </motion.button>
            
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              type="button"
              onClick={() => { onCancel(); navigate("/"); }}
              className="w-full py-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              Annuler et retourner
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
