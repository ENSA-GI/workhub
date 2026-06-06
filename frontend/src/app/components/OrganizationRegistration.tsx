import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegisterOrganization } from '@/lib/useOrg';
import { Eye, EyeOff, Loader2, Building, Mail, Phone, Lock, User, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import logo from '@/imports/Capture_d_écran_2026-04-20_183125-removebg-preview.png';

const PASSWORD_REQUIREMENTS_MESSAGE =
    'Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial';
const PASSWORD_COMPLEXITY_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/;

export default function OrganizationRegistration() {
    const navigate = useNavigate();
    const registerOrg = useRegisterOrganization();

    // Organisation fields
    const [name, setName] = useState('');
    const [legalName, setLegalName] = useState('');
    const [taxId, setTaxId] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [phone, setPhone] = useState('');

    // Admin user fields
    const [adminFirstName, setAdminFirstName] = useState('');
    const [adminLastName, setAdminLastName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        // Validation
        if (!name.trim()) return setError('Le nom commercial est requis');
        if (!legalName.trim()) return setError('La raison sociale est requise');
        if (!contactEmail.trim()) return setError('L\'email de contact est requis');
        if (!adminEmail.trim()) return setError('L\'email de l\'administrateur est requis');
        if (!adminPassword) return setError('Le mot de passe de l\'administrateur est requis');
        if (adminPassword !== adminConfirmPassword) return setError('Les mots de passe ne correspondent pas');
        if (adminPassword.length < 12 || !PASSWORD_COMPLEXITY_PATTERN.test(adminPassword)) {
            return setError(PASSWORD_REQUIREMENTS_MESSAGE);
        }

        try {
            await registerOrg.mutateAsync({
                name: name.trim(),
                legalName: legalName.trim(),
                adminEmail: adminEmail.trim(),
                adminPassword,
                adminFirstName: adminFirstName.trim() || undefined,
                adminLastName: adminLastName.trim() || undefined,
                adminPhone: phone.trim() || undefined,
            });
            navigate('/login?registered=true');
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.errors) {
                setFieldErrors(err.response.data.errors);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError(err.message || 'Erreur lors de la création de l\'organisation');
            }
        }
    };

    return (
        <div className="min-h-screen relative overflow-y-auto overflow-x-hidden bg-[#0F172A] flex flex-col items-center justify-center py-12 px-4">
            {/* Background Effects */}
            <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-blob" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-blob animation-delay-4000" />
            <div className="fixed top-[40%] left-[40%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none animate-blob animation-delay-2000" />

            <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute top-8 left-8"
            >
                <Link to="/" className="flex items-center">
                    <img src={logo} alt="WorkHub" className="h-12 invert brightness-0" />
                </Link>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full max-w-4xl"
            >
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 md:p-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                    <div className="text-center mb-10">
                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-3xl font-bold text-white mb-2"
                        >
                            Créer mon organisation
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-blue-100/70"
                        >
                            Créez votre espace WorkHub et devenez administrateur
                        </motion.p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 p-4 bg-red-500/20 border border-red-500/30 text-red-200 text-sm rounded-xl backdrop-blur-md"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {/* Section Organisation */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-5"
                        >
                            <div className="border-b border-white/10 pb-3 mb-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Building className="w-5 h-5 text-blue-400" />
                                    Informations de l'organisation
                                </h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5 ml-1">Nom commercial *</label>
                                <div className="relative group">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        placeholder="TechVision Maroc"
                                    />
                                </div>
                                {fieldErrors.name && <p className="text-xs text-red-400 mt-1 ml-1">{fieldErrors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5 ml-1">Raison sociale *</label>
                                <div className="relative group">
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        value={legalName}
                                        onChange={(e) => setLegalName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        placeholder="TechVision SARL"
                                    />
                                </div>
                                {fieldErrors.legalName && <p className="text-xs text-red-400 mt-1 ml-1">{fieldErrors.legalName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5 ml-1">Identifiant Fiscal / ICE</label>
                                <div className="relative group">
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="text"
                                        value={taxId}
                                        onChange={(e) => setTaxId(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        placeholder="ICE00123456..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5 ml-1">Email de contact *</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        placeholder="contact@entreprise.com"
                                    />
                                </div>
                                {fieldErrors.email && <p className="text-xs text-red-400 mt-1 ml-1">{fieldErrors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5 ml-1">Téléphone de contact</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        placeholder="+212520..."
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Section Administrateur */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="space-y-5"
                        >
                            <div className="border-b border-white/10 pb-3 mb-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <User className="w-5 h-5 text-purple-400" />
                                    Compte administrateur
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1.5 ml-1">Prénom</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                                        <input
                                            type="text"
                                            value={adminFirstName}
                                            onChange={(e) => setAdminFirstName(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                            placeholder="Jean"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1.5 ml-1">Nom</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={adminLastName}
                                            onChange={(e) => setAdminLastName(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                            placeholder="Dupont"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5 ml-1">Email de l'admin *</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={adminEmail}
                                        onChange={(e) => setAdminEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                        placeholder="admin@entreprise.com"
                                    />
                                </div>
                                {fieldErrors.adminEmail && <p className="text-xs text-red-400 mt-1 ml-1">{fieldErrors.adminEmail}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5 ml-1">Mot de passe *</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        autoComplete="new-password"
                                        value={adminPassword}
                                        onChange={(e) => setAdminPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                        placeholder="Min. 12 caractères"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-4 flex items-center text-white/40 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-xs text-blue-100/50 mt-1 ml-1">
                                    12 caractères min. avec majuscule, minuscule, chiffre et symbole.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5 ml-1">Confirmer mot de passe *</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        autoComplete="new-password"
                                        value={adminConfirmPassword}
                                        onChange={(e) => setAdminConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                        placeholder="Confirmer"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="md:col-span-2 mt-4"
                        >
                            <button
                                type="submit"
                                disabled={registerOrg.isPending}
                                className="group relative w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                                <span className="relative flex items-center justify-center space-x-2">
                                    {registerOrg.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                                    <span>{registerOrg.isPending ? 'Création en cours...' : 'Créer mon organisation'}</span>
                                </span>
                            </button>
                        </motion.div>
                    </form>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-8 text-center"
                    >
                        <span className="text-white/60 text-sm">Déjà une organisation ? </span>
                        <Link to="/" className="text-blue-400 font-semibold text-sm hover:text-blue-300 transition-colors">
                            Se connecter
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
