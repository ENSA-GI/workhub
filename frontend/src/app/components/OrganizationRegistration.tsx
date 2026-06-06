import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterOrganization } from '@/lib/useOrg';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const PASSWORD_REQUIREMENTS_MESSAGE =
    'Le mot de passe doit contenir au moins 12 caracteres, une majuscule, une minuscule, un chiffre et un caractere special';
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
        if (!name.trim()) {
            setError('Le nom commercial est requis');
            return;
        }
        if (!legalName.trim()) {
            setError('La raison sociale est requise');
            return;
        }
        if (!contactEmail.trim()) {
            setError('L\'email de contact est requis');
            return;
        }
        if (!adminEmail.trim()) {
            setError('L\'email de l\'administrateur est requis');
            return;
        }
        if (!adminPassword) {
            setError('Le mot de passe de l\'administrateur est requis');
            return;
        }
        if (adminPassword !== adminConfirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }
        if (adminPassword.length < 12) {
            setError(PASSWORD_REQUIREMENTS_MESSAGE);
            return;
        }
        if (!PASSWORD_COMPLEXITY_PATTERN.test(adminPassword)) {
            setError(PASSWORD_REQUIREMENTS_MESSAGE);
            return;
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
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
            <div className="bg-white border border-gray-200 p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Créer mon organisation</h2>
                    <p className="text-sm text-gray-600 mt-1">Créez votre espace WorkHub et devenez administrateur</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Section Organisation */}
                    <div className="border-b border-gray-200 pb-2 mb-2">
                        <h3 className="text-sm font-semibold text-gray-700">Informations de l'organisation</h3>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Nom commercial *
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                            placeholder="Ex: TechVision Maroc"
                        />
                        {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Raison sociale *
                        </label>
                        <input
                            type="text"
                            required
                            value={legalName}
                            onChange={(e) => setLegalName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                            placeholder="Ex: TechVision SARL"
                        />
                        {fieldErrors.legalName && <p className="text-xs text-red-600 mt-1">{fieldErrors.legalName}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Identifiant Fiscal / ICE
                        </label>
                        <input
                            type="text"
                            value={taxId}
                            onChange={(e) => setTaxId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                            placeholder="ICE00123456..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Email de contact *
                        </label>
                        <input
                            type="email"
                            required
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                            placeholder="contact@entreprise.com"
                        />
                        {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Téléphone de contact
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                            placeholder="+212520..."
                        />
                    </div>

                    {/* Section Administrateur */}
                    <div className="border-b border-gray-200 pb-2 mb-2">
                        <h3 className="text-sm font-semibold text-gray-700">Compte administrateur</h3>
                        <p className="text-xs text-gray-500">Cet utilisateur sera le premier administrateur de l'organisation</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                Prénom
                            </label>
                            <input
                                type="text"
                                value={adminFirstName}
                                onChange={(e) => setAdminFirstName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                                placeholder="Jean"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                Nom
                            </label>
                            <input
                                type="text"
                                value={adminLastName}
                                onChange={(e) => setAdminLastName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                                placeholder="Dupont"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Email de l'administrateur *
                        </label>
                        <input
                            type="email"
                            required
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                            placeholder="admin@entreprise.com"
                        />
                        {fieldErrors.adminEmail && <p className="text-xs text-red-600 mt-1">{fieldErrors.adminEmail}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Mot de passe *
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="new-password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                                placeholder="Minimum 12 caracteres"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            12 caracteres minimum avec majuscule, minuscule, chiffre et caractere special.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Confirmer le mot de passe *
                        </label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={adminConfirmPassword}
                            onChange={(e) => setAdminConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={registerOrg.isPending}
                        className="w-full py-2.5 bg-[#0A6ED1] text-white font-medium rounded hover:bg-[#0959b0] disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {registerOrg.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {registerOrg.isPending ? 'Création en cours...' : 'Créer mon organisation'}
                    </button>
                </form>
            </div>
        </div>
    );
}
