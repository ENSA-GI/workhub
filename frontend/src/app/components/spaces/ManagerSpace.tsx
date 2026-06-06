import { Users, Clock, TrendingUp, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { loadFromLocalStorage } from '../../utils/dataManager';

export default function ManagerSpace() {
  const [teamMembers] = useState([
    { id: 1, name: 'Sarah Johnson', position: 'Senior Developer', status: 'Active', performance: 92 },
    { id: 2, name: 'Michael Chen', position: 'Developer', status: 'Active', performance: 88 },
    { id: 3, name: 'Emily Rodriguez', position: 'Junior Developer', status: 'Active', performance: 85 },
  ]);

  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);

  useEffect(() => {
    const leaves = loadFromLocalStorage('workhub_leave_requests', []);
    setPendingLeaves(leaves.filter((l: any) => l.status === 'Pending').slice(0, 5));
  }, []);

  const handleApprove = (id: number) => {
    setPendingLeaves(prev => prev.filter(l => l.id !== id));
  };

  const handleReject = (id: number) => {
    setPendingLeaves(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Gestion d'Équipe</h1>
        <p className="text-sm text-gray-600 mt-1">Gérez votre équipe et validez les demandes</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Users className="w-5 h-5 text-[#0A6ED1] mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Membres d'équipe</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{teamMembers.length}</p>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-orange-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Demandes en attente</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{pendingLeaves.length}</p>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Performance moyenne</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">88%</p>
        </div>
      </div>

      {/* Mon Équipe */}
      <div className="bg-white border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Mon Équipe</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#0A6ED1] flex items-center justify-center text-white text-sm mr-3">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{member.position}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800">
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{member.performance}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demandes de Congés */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Demandes de Congés à Valider</h3>
        </div>
        {pendingLeaves.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jours</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{leave.employee}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{leave.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(leave.startDate).toLocaleDateString('fr-FR')} - {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{leave.days}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleApprove(leave.id)}
                          className="px-3 py-1 bg-green-600 text-white text-xs hover:bg-green-700"
                          title="Approuver"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(leave.id)}
                          className="px-3 py-1 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50"
                          title="Rejeter"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">Aucune demande en attente</p>
          </div>
        )}
      </div>
    </div>
  );
}
