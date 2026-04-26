import { Users, Search, Filter, Download, Eye, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useState } from 'react';

export default function EmployeesView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('Tous');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);

  const employees = [
    { id: 1, nom: 'Alami', prenom: 'Mohammed', email: 'mohammed.alami@techvision.ma', poste: 'Développeur Full-Stack', departement: 'IT', statut: 'Actif', dateEntree: '2023-03-15', salaire: 6500, typeContrat: 'CDI' },
    { id: 2, nom: 'Bennani', prenom: 'Sara', email: 'sara@techvision.ma', poste: 'RH Manager', departement: 'RH', statut: 'Actif', dateEntree: '2023-06-20', salaire: 5800, typeContrat: 'CDI' },
    { id: 3, nom: 'Zahra', prenom: 'Fatima', email: 'fatima@techvision.ma', poste: 'RH Manager', departement: 'RH', statut: 'Actif', dateEntree: '2023-01-15', salaire: 6000, typeContrat: 'CDI' },
    { id: 4, nom: 'Tazi', prenom: 'Ahmed', email: 'ahmed.tazi@techvision.ma', poste: 'Commercial Senior', departement: 'Ventes', statut: 'Actif', dateEntree: '2022-11-10', salaire: 5500, typeContrat: 'CDI' },
    { id: 5, nom: 'El Amrani', prenom: 'Karim', email: 'karim@techvision.ma', poste: 'Marketing Manager', departement: 'Marketing', statut: 'Actif', dateEntree: '2024-02-01', salaire: 5200, typeContrat: 'CDI' },
  ];

  const departments = ['Tous', 'IT', 'RH', 'Ventes', 'Marketing', 'Finance'];
  const statuses = ['Tous', 'Actif', 'En congé', 'Inactif'];

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.poste.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDepartment = filterDepartment === 'Tous' || emp.departement === filterDepartment;
    const matchStatus = filterStatus === 'Tous' || emp.statut === filterStatus;
    return matchSearch && matchDepartment && matchStatus;
  });

  const employeeDetail = selectedEmployee
    ? employees.find((e) => e.id === selectedEmployee)
    : null;

  const stats = {
    total: employees.length,
    actifs: employees.filter((e) => e.statut === 'Actif').length,
    masseSalariale: employees.reduce((sum, e) => sum + e.salaire, 0),
    coutMoyen: Math.round(employees.reduce((sum, e) => sum + e.salaire, 0) / employees.length),
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Vue Employés</h1>
        <p className="text-sm text-gray-600 mt-1">Supervision et analyse de votre effectif</p>
      </div>

      {/* Statistiques Globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase">Total Employés</h3>
            <Users className="w-5 h-5 text-[#0A6ED1]" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase">Actifs</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">{stats.actifs}</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase">Masse Salariale</h3>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">MAD {stats.masseSalariale.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase">Coût Moyen</h3>
            <DollarSign className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">MAD {stats.coutMoyen.toLocaleString()}</p>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="bg-white border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, poste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
            />
          </div>
          <div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  Département: {dept}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  Statut: {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des Employés */}
        <div className="lg:col-span-2 bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              Liste des Employés ({filteredEmployees.length})
            </h3>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center text-sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Département</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedEmployee === employee.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedEmployee(employee.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-[#0A6ED1] flex items-center justify-center text-white text-sm mr-3">
                          {employee.prenom[0]}{employee.nom[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{employee.prenom} {employee.nom}</p>
                          <p className="text-xs text-gray-500">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{employee.poste}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{employee.departement}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800">
                        {employee.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEmployee(employee.id);
                        }}
                        className="p-1 hover:bg-blue-50 text-blue-600"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Détail de l'Employé Sélectionné */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Détails Employé</h3>
          </div>
          <div className="p-6">
            {employeeDetail ? (
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200">
                  <div className="w-16 h-16 bg-[#0A6ED1] flex items-center justify-center text-white text-2xl mb-4">
                    {employeeDetail.prenom[0]}{employeeDetail.nom[0]}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">{employeeDetail.prenom} {employeeDetail.nom}</h4>
                  <p className="text-sm text-gray-600">{employeeDetail.poste}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Email</span>
                    <span className="text-sm font-medium text-gray-900">{employeeDetail.email}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Département</span>
                    <span className="text-sm font-medium text-gray-900">{employeeDetail.departement}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Type de Contrat</span>
                    <span className="text-sm font-medium text-gray-900">{employeeDetail.typeContrat}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Date d'entrée</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(employeeDetail.dateEntree).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Salaire</span>
                    <span className="text-sm font-medium text-gray-900">MAD {employeeDetail.salaire.toLocaleString()}/mois</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Statut</span>
                    <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800">
                      {employeeDetail.statut}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">
                    Voir Profil Complet
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-600">Sélectionnez un employé pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Répartition par Département */}
      <div className="mt-6 bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-[#0A6ED1] mr-2" />
            <h3 className="text-base font-semibold text-gray-900">Répartition par Département</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {departments.filter((d) => d !== 'Tous').map((dept) => {
              const count = employees.filter((e) => e.departement === dept).length;
              const percentage = Math.round((count / employees.length) * 100);
              return (
                <div key={dept} className="bg-[#F5F7FA] border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 uppercase mb-2">{dept}</p>
                  <p className="text-2xl font-semibold text-gray-900 mb-1">{count}</p>
                  <div className="w-full bg-gray-200 h-2 mt-2">
                    <div className="bg-[#0A6ED1] h-2" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{percentage}% de l'effectif</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Mode Supervision Uniquement</h4>
        <p className="text-sm text-blue-800">
          En tant qu'Administrateur d'Organisation, vous avez accès à la visualisation et à l'analyse de tous les employés.
          La création, modification et suppression d'employés sont effectuées par l'équipe RH.
        </p>
      </div>
    </div>
  );
}
