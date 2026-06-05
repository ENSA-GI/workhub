import { useMemo, useState } from "react";
import { X, Save, User } from "lucide-react";
import {
    Employee,
    CreateEmployeeRequest,
    UpdateEmployeeRequest,
    useCreateEmployee,
    useUpdateEmployee,
} from "@/lib/useEmployees";

type EmployeeFormValues = {
    // commun
    organizationId: string;

    // create-only (mais on les affiche aussi en edit en lecture seule)
    userId?: string;
    cin?: string;
    birthDate?: string;
    hireDate?: string;
    contractType?: string;
    contractEndDate?: string;

    // commun / update
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

    // update-only
    changeReason?: string;
};

interface Props {
    organizationId: string;
    employee?: Employee; // si présent => edit
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

        // Edit: on pré-remplit avec l'employé
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
        if (errors[key as string]) {
            setErrors((e) => ({ ...e, [key as string]: "" }));
        }
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

                await updateMutation.mutateAsync({
                    id: employee!.id,
                    organizationId,
                    data: updateData,
                });

                alert("✅ Employé mis à jour");
                onClose();
                return;
            }

            const err = validateCreate();
            if (err) {
                alert("❌ " + err);
                return;
            }

            const createData: CreateEmployeeRequest = {
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
            };

            await createMutation.mutateAsync(createData);
            alert("✅ Employé créé");
            onClose();
        } catch (err: any) {
            console.error(err);
            const data = err?.response?.data;

            // Si le serveur renvoie un JSON {field: message}
            if (data && typeof data === "object") {
                setErrors(data);
            } else {
                alert("❌ Erreur: " + (err.message || "Erreur inconnue"));
            }
        }
    };

    const pending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white max-w-5xl w-full my-8">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#0A6ED1]/10 border-2 border-[#0A6ED1] flex items-center justify-center">
                            <User className="w-5 h-5 text-[#0A6ED1]" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {isEdit ? "Modifier Employé" : "Nouvel Employé"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-8">
                    {/* Infos personnelles */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4 border-l-4 border-[#0A6ED1] pl-3">
                            Informations Personnelles
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* CIN */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CIN *</label>
                                <input
                                    value={values.cin || ""}
                                    onChange={(e) => setField("cin", e.target.value)}
                                    disabled={isEdit}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none disabled:bg-gray-100"
                                />
                                {errors.cin && <p className="mt-1 text-xs text-red-600">{errors.cin}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    value={values.personalEmail || ""}
                                    onChange={(e) => setField("personalEmail", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                                />
                                {errors.personalEmail && <p className="mt-1 text-xs text-red-600">{errors.personalEmail}</p>}
                            </div>

                            {/* BirthDate */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label>
                                <input
                                    type="date"
                                    value={values.birthDate || ""}
                                    onChange={(e) => setField("birthDate", e.target.value)}
                                    disabled={isEdit}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none disabled:bg-gray-100"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                <input
                                    value={values.personalPhone || ""}
                                    onChange={(e) => setField("personalPhone", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                                />
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                                <input
                                    value={values.address || ""}
                                    onChange={(e) => setField("address", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                                <input
                                    value={values.city || ""}
                                    onChange={(e) => setField("city", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                                <input
                                    value={values.postalCode || ""}
                                    onChange={(e) => setField("postalCode", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contrat */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4 border-l-4 border-[#0A6ED1] pl-3">
                            Contrat & Poste
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {!isEdit && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">User ID *</label>
                                    <input
                                        value={values.userId || ""}
                                        onChange={(e) => setField("userId", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'embauche *</label>
                                <input
                                    type="date"
                                    value={values.hireDate || ""}
                                    onChange={(e) => setField("hireDate", e.target.value)}
                                    disabled={isEdit}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type contrat *</label>
                                <select
                                    value={values.contractType || "CDI"}
                                    onChange={(e) => setField("contractType", e.target.value)}
                                    disabled={isEdit}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none disabled:bg-gray-100"
                                >
                                    <option value="CDI">CDI</option>
                                    <option value="CDD">CDD</option>
                                    <option value="STAGE">STAGE</option>
                                    <option value="FREELANCE">FREELANCE</option>
                                </select>
                            </div>

                            {!isEdit && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Département ID *</label>
                                        <input
                                            value={values.departmentId || ""}
                                            onChange={(e) => setField("departmentId", e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Poste ID *</label>
                                        <input
                                            value={values.positionId || ""}
                                            onChange={(e) => setField("positionId", e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                                <select
                                    value={values.category || "EMPLOYE"}
                                    onChange={(e) => setField("category", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                                >
                                    <option value="EMPLOYE">EMPLOYE</option>
                                    <option value="AGENT_MAITRISE">AGENT_MAITRISE</option>
                                    <option value="CADRE">CADRE</option>
                                    <option value="STAGIAIRE">STAGIAIRE</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Salaire */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4 border-l-4 border-[#0A6ED1] pl-3">
                            Salaire & Banque
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Salaire de base *</label>
                                <input
                                    type="number"
                                    min="3112"
                                    step="0.01"
                                    value={values.baseSalary ?? ""}
                                    onChange={(e) => setField("baseSalary", e.target.value === "" ? undefined : Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prime transport</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={values.transportBonus ?? 0}
                                    onChange={(e) => setField("transportBonus", Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Banque</label>
                                <input
                                    value={values.bankName || ""}
                                    onChange={(e) => setField("bankName", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">RIB/Compte</label>
                                <input
                                    value={values.bankAccount || ""}
                                    onChange={(e) => setField("bankAccount", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                                />
                            </div>
                        </div>

                        {isEdit && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Raison de la modification</label>
                                <textarea
                                    value={values.changeReason || ""}
                                    onChange={(e) => setField("changeReason", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0A6ED1] focus:ring-1 focus:ring-[#0A6ED1] outline-none"
                                    rows={2}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={pending}
                            className="px-6 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{isEdit ? "Mettre à jour" : "Créer"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}