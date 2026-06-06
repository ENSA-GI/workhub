import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Save, User, Briefcase, CreditCard, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import {
    Employee,
    CreateEmployeeRequest,
    UpdateEmployeeRequest,
    useCreateEmployee,
    useUpdateEmployee,
} from "@/lib/useEmployees";

type EmployeeFormValues = {
    organizationId: string;
    userId?: string;
    cin?: string;
    birthDate?: string;
    hireDate?: string;
    contractType?: string;
    contractEndDate?: string;
    personalEmail?: string;
    personalPhone?: string;
    birthPlace?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    maritalStatus?: string;
    childrenCount?: number;
    departmentId?: string;
    positionId?: string;
    category?: string;
    baseSalary?: number;
    transportBonus?: number;
    mealBonus?: number;
    cnssNumber?: string;
    amoNumber?: string;
    bankName?: string;
    bankAccount?: string;
    changeReason?: string;
};

interface Props {
    organizationId: string;
    employee?: Employee;
    onClose: () => void;
}

export default function EmployeeFormModal({ organizationId, employee, onClose }: Props) {
    const isEdit = !!employee;
    const createMutation = useCreateEmployee();
    const updateMutation = useUpdateEmployee();

    const initialValues: EmployeeFormValues = useMemo(() => {
        if (!employee) {
            return {
                organizationId,
                contractType: "CDI",
                category: "EMPLOYE",
                maritalStatus: "SINGLE",
                childrenCount: 0,
                transportBonus: 0,
                mealBonus: 0,
            };
        }
        return {
            organizationId,
            userId: employee.userId,
            cin: employee.cin,
            birthDate: employee.birthDate,
            hireDate: employee.hireDate,
            contractType: employee.contractType,
            contractEndDate: employee.contractEndDate,
            personalEmail: employee.personalEmail,
            personalPhone: employee.personalPhone,
            birthPlace: employee.birthPlace,
            address: employee.address,
            city: employee.city,
            postalCode: employee.postalCode,
            maritalStatus: employee.maritalStatus,
            childrenCount: employee.childrenCount,
            departmentId: employee.departmentId,
            positionId: employee.positionId,
            category: employee.category,
            baseSalary: employee.baseSalary,
            transportBonus: employee.transportBonus,
            mealBonus: employee.mealBonus,
            cnssNumber: employee.cnssNumber,
            amoNumber: employee.amoNumber,
            bankName: employee.bankName,
            bankAccount: employee.bankAccount,
            changeReason: "",
        };
    }, [employee, organizationId]);

    const [values, setValues] = useState<EmployeeFormValues>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const setField = (key: keyof EmployeeFormValues, value: any) => {
        setValues((v) => ({ ...v, [key]: value }));
        if (errors[key as string]) setErrors((e) => ({ ...e, [key as string]: "" }));
    };

    const validateCreate = (): string | null => {
        const required: Array<[keyof EmployeeFormValues, string]> = [
            ["userId", "User ID obligatoire"],
            ["cin", "CIN obligatoire"],
            ["birthDate", "Date de naissance obligatoire"],
            ["hireDate", "Date d'embauche obligatoire"],
            ["contractType", "Type de contrat obligatoire"],
            ["departmentId", "Department ID obligatoire"],
            ["positionId", "Position ID obligatoire"],
            ["category", "Catégorie obligatoire"],
            ["baseSalary", "Salaire de base obligatoire"],
            ["personalEmail", "Email obligatoire"],
        ];
        for (const [k, msg] of required) {
            if (values[k] === undefined || values[k] === null || values[k] === "") return msg;
        }
        return null;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        try {
            if (isEdit) {
                const updateData: UpdateEmployeeRequest = {
                    address: values.address,
                    city: values.city,
                    postalCode: values.postalCode,
                    personalPhone: values.personalPhone,
                    personalEmail: values.personalEmail,
                    maritalStatus: values.maritalStatus,
                    childrenCount: values.childrenCount,
                    departmentId: values.departmentId,
                    positionId: values.positionId,
                    category: values.category,
                    baseSalary: values.baseSalary,
                    transportBonus: values.transportBonus,
                    mealBonus: values.mealBonus,
                    cnssNumber: values.cnssNumber,
                    amoNumber: values.amoNumber,
                    bankName: values.bankName,
                    bankAccount: values.bankAccount,
                    changeReason: values.changeReason,
                };
                await updateMutation.mutateAsync({ id: employee!.id, organizationId, data: updateData });
                alert("✅ Employé mis à jour");
                onClose();
                return;
            }

            const err = validateCreate();
            if (err) return alert("❌ " + err);

            await createMutation.mutateAsync({
                organizationId,
                userId: values.userId!,
                cin: values.cin!,
                birthDate: values.birthDate!,
                hireDate: values.hireDate!,
                contractType: values.contractType!,
                contractEndDate: values.contractEndDate,
                departmentId: values.departmentId!,
                positionId: values.positionId!,
                category: values.category!,
                baseSalary: values.baseSalary!,
                personalEmail: values.personalEmail!,
                personalPhone: values.personalPhone,
                address: values.address,
                city: values.city,
                postalCode: values.postalCode,
                birthPlace: values.birthPlace,
                maritalStatus: values.maritalStatus,
                childrenCount: values.childrenCount,
                transportBonus: values.transportBonus,
                mealBonus: values.mealBonus,
                cnssNumber: values.cnssNumber,
                amoNumber: values.amoNumber,
                bankName: values.bankName,
                bankAccount: values.bankAccount,
            });
            alert("✅ Employé créé");
            onClose();
        } catch (err: any) {
            console.error(err);
            const data = err?.response?.data;
            if (data && typeof data === "object") setErrors(data);
            else alert("❌ Erreur: " + (err.message || "Erreur inconnue"));
        }
    };

    const pending = createMutation.isPending || updateMutation.isPending;

    const InputRow = ({ label, required, children, error }: any) => (
        <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5 ml-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="mt-1 ml-1 text-xs text-red-500">{error}</p>}
        </div>
    );

    const inputClasses = "w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:border-[#0A6ED1] focus:ring-2 focus:ring-[#0A6ED1]/20 outline-none transition-all disabled:bg-gray-100 disabled:opacity-70 text-sm";

    const modalContent = (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white max-w-3xl w-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
            >
                {/* Header */}
                <div className="bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between z-10 shadow-sm">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-tr from-[#0A6ED1] to-blue-400 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                {isEdit ? "Modifier Employé" : "Nouvel Employé"}
                            </h2>
                            <p className="text-sm font-medium text-gray-500 mt-0.5">
                                {isEdit ? "Mettre à jour les informations" : "Ajouter un collaborateur"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content */}
                <form id="employee-form" onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-8">
                    
                    {/* Infos Personnelles */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center space-x-2 mb-6 pb-3 border-b border-gray-100">
                            <User className="w-5 h-5 text-blue-500" />
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Informations Personnelles</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputRow label="CIN" required error={errors.cin}>
                                <input value={values.cin || ""} onChange={(e) => setField("cin", e.target.value)} disabled={isEdit} className={inputClasses} placeholder="Ex: AB123456" />
                            </InputRow>
                            <InputRow label="Email" required error={errors.personalEmail}>
                                <input type="email" value={values.personalEmail || ""} onChange={(e) => setField("personalEmail", e.target.value)} className={inputClasses} placeholder="nom@example.com" />
                            </InputRow>
                            <InputRow label="Date de naissance" required>
                                <input type="date" value={values.birthDate || ""} onChange={(e) => setField("birthDate", e.target.value)} disabled={isEdit} className={inputClasses} />
                            </InputRow>
                            <InputRow label="Téléphone">
                                <input value={values.personalPhone || ""} onChange={(e) => setField("personalPhone", e.target.value)} className={inputClasses} placeholder="+212..." />
                            </InputRow>
                            <div className="md:col-span-2">
                                <InputRow label="Adresse">
                                    <input value={values.address || ""} onChange={(e) => setField("address", e.target.value)} className={inputClasses} placeholder="123 Rue de la Paix" />
                                </InputRow>
                            </div>
                            <InputRow label="Ville">
                                <input value={values.city || ""} onChange={(e) => setField("city", e.target.value)} className={inputClasses} placeholder="Casablanca" />
                            </InputRow>
                            <InputRow label="Code postal">
                                <input value={values.postalCode || ""} onChange={(e) => setField("postalCode", e.target.value)} className={inputClasses} placeholder="20000" />
                            </InputRow>
                        </div>
                    </div>

                    {/* Contrat */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center space-x-2 mb-6 pb-3 border-b border-gray-100">
                            <Briefcase className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Contrat & Poste</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {!isEdit && (
                                <InputRow label="User ID" required>
                                    <input value={values.userId || ""} onChange={(e) => setField("userId", e.target.value)} className={inputClasses} placeholder="Identifiant unique" />
                                </InputRow>
                            )}
                            <InputRow label="Date d'embauche" required>
                                <input type="date" value={values.hireDate || ""} onChange={(e) => setField("hireDate", e.target.value)} disabled={isEdit} className={inputClasses} />
                            </InputRow>
                            <InputRow label="Type de contrat" required>
                                <select value={values.contractType || "CDI"} onChange={(e) => setField("contractType", e.target.value)} disabled={isEdit} className={inputClasses}>
                                    <option value="CDI">CDI</option>
                                    <option value="CDD">CDD</option>
                                    <option value="STAGE">STAGE</option>
                                    <option value="FREELANCE">FREELANCE</option>
                                </select>
                            </InputRow>
                            {!isEdit && (
                                <>
                                    <InputRow label="Département ID" required>
                                        <input value={values.departmentId || ""} onChange={(e) => setField("departmentId", e.target.value)} className={inputClasses} placeholder="DEP-XXX" />
                                    </InputRow>
                                    <InputRow label="Poste ID" required>
                                        <input value={values.positionId || ""} onChange={(e) => setField("positionId", e.target.value)} className={inputClasses} placeholder="POS-XXX" />
                                    </InputRow>
                                </>
                            )}
                            <InputRow label="Catégorie" required>
                                <select value={values.category || "EMPLOYE"} onChange={(e) => setField("category", e.target.value)} className={inputClasses}>
                                    <option value="EMPLOYE">EMPLOYE</option>
                                    <option value="AGENT_MAITRISE">AGENT_MAITRISE</option>
                                    <option value="CADRE">CADRE</option>
                                    <option value="STAGIAIRE">STAGIAIRE</option>
                                </select>
                            </InputRow>
                        </div>
                    </div>

                    {/* Salaire & Banque */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center space-x-2 mb-6 pb-3 border-b border-gray-100">
                            <CreditCard className="w-5 h-5 text-emerald-500" />
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Salaire & Banque</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputRow label="Salaire de base (MAD)" required>
                                <input type="number" min="3112" step="0.01" value={values.baseSalary ?? ""} onChange={(e) => setField("baseSalary", e.target.value === "" ? undefined : Number(e.target.value))} className={inputClasses} placeholder="0.00" />
                            </InputRow>
                            <InputRow label="Prime transport (MAD)">
                                <input type="number" min="0" step="0.01" value={values.transportBonus ?? 0} onChange={(e) => setField("transportBonus", Number(e.target.value))} className={inputClasses} />
                            </InputRow>
                            <InputRow label="Banque">
                                <input value={values.bankName || ""} onChange={(e) => setField("bankName", e.target.value)} className={inputClasses} placeholder="Nom de la banque" />
                            </InputRow>
                            <InputRow label="RIB/Compte">
                                <input value={values.bankAccount || ""} onChange={(e) => setField("bankAccount", e.target.value)} className={inputClasses} placeholder="RIB à 24 chiffres" />
                            </InputRow>
                        </div>
                        {isEdit && (
                            <div className="mt-5">
                                <InputRow label="Raison de la modification">
                                    <textarea value={values.changeReason || ""} onChange={(e) => setField("changeReason", e.target.value)} className={`${inputClasses} resize-none`} rows={3} placeholder="Pourquoi modifiez-vous ce dossier ?" />
                                </InputRow>
                            </div>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end space-x-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                        Annuler
                    </button>
                    <button type="submit" form="employee-form" disabled={pending} className="px-8 py-2.5 bg-gradient-to-r from-[#0A6ED1] to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center space-x-2 disabled:opacity-50">
                        {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span>{isEdit ? "Mettre à jour" : "Enregistrer l'employé"}</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );

    return createPortal(modalContent, document.body);
}