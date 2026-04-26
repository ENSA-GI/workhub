import { Calendar, DollarSign, FileText, Plus, Download } from 'lucide-react';
import { useState } from 'react';

export default function EmployeeSpace() {
  const [myLeaves] = useState([
    { id: 1, type: 'Congés Annuels', startDate: '2026-06-15', endDate: '2026-06-20', days: 5, status: 'Approuvé' },
    { id: 2, type: 'Congés Maladie', startDate: '2026-05-10', endDate: '2026-05-11', days: 2, status: 'Approuvé' },
  ]);

  const [myPayslips] = useState([
    { id: 1, month: 'Mai 2026', gross: 5500, net: 4200, date: '2026-05-31' },
    { id: 2, month: 'Avril 2026', gross: 5500, net: 4200, date: '2026-04-30' },
    { id: 3, month: 'Mars 2026', gross: 5500, net: 4200, date: '2026-03-31' },
  ]);

  const leavesBalance = {
    annual: { total: 25, used: 7, remaining: 18 },
    sick: { total: 10, used: 2, remaining: 8 },
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Mon Espace Employé</h1>
        <p className="text-sm text-gray-600 mt-1">Gérez vos congés et consultez vos documents</p>
      </div>

      {/* Solde de Congés */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-[#0A6ED1] mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Congés Annuels</h3>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-semibold text-gray-900">{leavesBalance.annual.remaining}</p>
            <p className="text-sm text-gray-600 mt-1">jours restants sur {leavesBalance.annual.total}</p>
          </div>
          <div className="w-full bg-gray-200 h-1">
            <div
              className="bg-[#0A6ED1] h-1"
              style={{ width: `${(leavesBalance.annual.used / leavesBalance.annual.total) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{leavesBalance.annual.used} jours utilisés</p>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-green-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Congés Maladie</h3>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-semibold text-gray-900">{leavesBalance.sick.remaining}</p>
            <p className="text-sm text-gray-600 mt-1">jours restants sur {leavesBalance.sick.total}</p>
          </div>
          <div className="w-full bg-gray-200 h-1">
            <div
              className="bg-green-500 h-1"
              style={{ width: `${(leavesBalance.sick.used / leavesBalance.sick.total) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{leavesBalance.sick.used} jours utilisés</p>
        </div>
      </div>

      {/* Mes Congés */}
      <div className="bg-white border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Mes Demandes de Congés</h3>
          <button className="px-4 py-2 bg-[#0A6ED1] text-white text-sm hover:bg-[#0959b0] flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle demande
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {myLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{leave.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(leave.startDate).toLocaleDateString('fr-FR')} - {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{leave.days}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800">
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mes Fiches de Paie */}
      <div className="bg-white border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Mes Fiches de Paie</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mois</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salaire Brut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salaire Net</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {myPayslips.map((payslip) => (
                <tr key={payslip.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{payslip.month}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payslip.gross}MAD </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{payslip.net}MAD </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100" title="Télécharger">
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Mes Documents</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-6 border border-gray-300 hover:border-[#0A6ED1] hover:bg-gray-50 transition-colors text-center">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">Contrat de Travail</p>
            </button>
            <button className="p-6 border border-gray-300 hover:border-[#0A6ED1] hover:bg-gray-50 transition-colors text-center">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">Attestation</p>
            </button>
            <button className="p-6 border border-gray-300 hover:border-[#0A6ED1] hover:bg-gray-50 transition-colors text-center">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">Certificat de Travail</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
