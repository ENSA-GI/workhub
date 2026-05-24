import { DollarSign, Calendar, Users, Calculator, Download, Save, CheckCircle, AlertCircle, Edit2, Plus, Search, Filter, CheckSquare, Square } from 'lucide-react';
import { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { saveToLocalStorage, loadFromLocalStorage } from '../../../utils/dataManager';

export default function PayrollGeneration() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('2026-04');
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('Tous');
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  const employees = [
    { id: 1, matricule: 'EMP001', nom: 'Alami', prenom: 'Mohammed', departement: 'IT', poste: 'Développeur Senior', salaireBrut: 12000, anciennete: 850, transport: 500, primePerf: 0, absences: 0, heuresSupp: 0 },
    { id: 2, matricule: 'EMP002', nom: 'Bennani', prenom: 'Sara', departement: 'IT', poste: 'Chef de Projet', salaireBrut: 15000, anciennete: 1200, transport: 500, primePerf: 0, absences: 0, heuresSupp: 0 },
    { id: 3, matricule: 'EMP003', nom: 'Zahra', prenom: 'Fatima', departement: 'RH', poste: 'Analyste RH', salaireBrut: 9000, anciennete: 450, transport: 500, primePerf: 0, absences: 0, heuresSupp: 0 },
    { id: 4, matricule: 'EMP004', nom: 'Alaoui', prenom: 'Karim', departement: 'Ventes', poste: 'Commercial Senior', salaireBrut: 8500, anciennete: 350, transport: 500, primePerf: 0, absences: 1, heuresSupp: 0 },
    { id: 5, matricule: 'EMP005', nom: 'Idrissi', prenom: 'Amina', departement: 'Finance', poste: 'Comptable', salaireBrut: 10000, anciennete: 600, transport: 500, primePerf: 0, absences: 0, heuresSupp: 5 },
    { id: 6, matricule: 'EMP006', nom: 'El Fassi', prenom: 'Youssef', departement: 'IT', poste: 'Développeur', salaireBrut: 9500, anciennete: 475, transport: 500, primePerf: 0, absences: 0, heuresSupp: 3 },
    { id: 7, matricule: 'EMP007', nom: 'Tazi', prenom: 'Nadia', departement: 'Marketing', poste: 'Chef Marketing', salaireBrut: 11000, anciennete: 800, transport: 500, primePerf: 0, absences: 0, heuresSupp: 0 },
    { id: 8, matricule: 'EMP008', nom: 'Berrada', prenom: 'Hassan', departement: 'Ventes', poste: 'Commercial', salaireBrut: 7500, anciennete: 300, transport: 400, primePerf: 0, absences: 0, heuresSupp: 0 },
    { id: 9, matricule: 'EMP009', nom: 'Alami', prenom: 'Zineb', departement: 'RH', poste: 'RH Manager', salaireBrut: 13000, anciennete: 1000, transport: 500, primePerf: 0, absences: 0, heuresSupp: 0 },
    { id: 10, matricule: 'EMP010', nom: 'Bennani', prenom: 'Omar', departement: 'IT', poste: 'DevOps Engineer', salaireBrut: 11500, anciennete: 700, transport: 500, primePerf: 0, absences: 0, heuresSupp: 8 },
    { id: 11, matricule: 'EMP011', nom: 'Chakir', prenom: 'Leila', departement: 'Finance', poste: 'Analyste Financier', salaireBrut: 9000, anciennete: 450, transport: 400, primePerf: 0, absences: 2, heuresSupp: 0 },
    { id: 12, matricule: 'EMP012', nom: 'El Idrissi', prenom: 'Ahmed', departement: 'IT', poste: 'Développeur Junior', salaireBrut: 7000, anciennete: 0, transport: 400, primePerf: 0, absences: 0, heuresSupp: 0 },
    { id: 13, matricule: 'EMP013', nom: 'Fassi', prenom: 'Sanaa', departement: 'Marketing', poste: 'Social Media Manager', salaireBrut: 8000, anciennete: 350, transport: 400, primePerf: 0, absences: 1, heuresSupp: 0 },
    { id: 14, matricule: 'EMP014', nom: 'Tazi', prenom: 'Mehdi', departement: 'Ventes', poste: 'Responsable Commercial', salaireBrut: 12000, anciennete: 900, transport: 500, primePerf: 0, absences: 0, heuresSupp: 0 },
    { id: 15, matricule: 'EMP015', nom: 'Alaoui', prenom: 'Rachid', departement: 'IT', poste: 'Tech Lead', salaireBrut: 16000, anciennete: 1400, transport: 500, primePerf: 0, absences: 0, heuresSupp: 0 },
    { id: 16, matricule: 'EMP016', nom: 'Benjelloun', prenom: 'Imane', departement: 'Finance', poste: 'Contrôleur de Gestion', salaireBrut: 10500, anciennete: 650, transport: 500, primePerf: 0, absences: 0, heuresSupp: 0 },
    { id: 17, matricule: 'EMP017', nom: 'Chraibi', prenom: 'Kamal', departement: 'Ventes', poste: 'Commercial', salaireBrut: 7500, anciennete: 300, transport: 400, primePerf: 0, absences: 0, heuresSupp: 0 },
    { id: 18, matricule: 'EMP018', nom: 'El Amrani', prenom: 'Salma', departement: 'RH', poste: 'Assistant RH', salaireBrut: 6500, anciennete: 0, transport: 300, primePerf: 0, absences: 0, heuresSupp: 0 },
  ];

  const calculateNet = (emp: typeof employees[0]) => {
    const brut = emp.salaireBrut + emp.anciennete + emp.transport + emp.primePerf + (emp.heuresSupp * 150);
    const cnss = brut * 0.0448;
    const amo = brut * 0.0226;
    const ir = brut * 0.10;
    const absencesDeduction = (emp.salaireBrut / 26) * emp.absences;
    return brut - cnss - amo - ir - absencesDeduction;
  };

  const filteredEmployees = employees.filter(emp => {
    const matchSearch = emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       emp.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = filterDept === 'Tous' || emp.departement === filterDept;
    return matchSearch && matchDept;
  });

  const totalBrut = filteredEmployees.reduce((sum, emp) => sum + emp.salaireBrut + emp.anciennete + emp.transport + emp.primePerf + (emp.heuresSupp * 150), 0);
  const totalNet = filteredEmployees.reduce((sum, emp) => sum + calculateNet(emp), 0);
  const totalCharges = totalBrut - totalNet;

  const departments = ['Tous', 'IT', 'Ventes', 'Marketing', 'RH', 'Finance'];

  const toggleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(e => e.id));
    }
  };

  const toggleSelectEmployee = (id: number) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter((eid: number) => eid !== id));
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
    }
  };

  const applyBulkBonus = () => {
    const bonus = prompt('Entrez le montant de la prime à appliquer (MAD):');
    if (bonus && selectedEmployees.length > 0) {
      alert(`Prime de MAD ${bonus} appliquée à ${selectedEmployees.length} employé(s)`);
    }
  };

  const applyBulkOvertimeHours = () => {
    const hours = prompt('Entrez le nombre d\'heures supplémentaires:');
    if (hours && selectedEmployees.length > 0) {
      alert(`${hours} heures supplémentaires appliquées à ${selectedEmployees.length} employé(s)`);
    }
  };

  const savePayroll = (status: 'Draft' | 'Processed') => {
    const monthName = new Date(selectedMonth + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    // Charger les paies existantes
    const existingPayrolls = loadFromLocalStorage('workhub_payrolls', []);

    // Vérifier si une paie existe déjà pour ce mois
    const existingIndex = existingPayrolls.findIndex((p: any) => p.month === monthName);

    const payrollData = {
      id: existingIndex >= 0 ? existingPayrolls[existingIndex].id : Math.max(...existingPayrolls.map((p: any) => p.id), 0) + 1,
      month: monthName,
      employees: filteredEmployees.length,
      grossAmount: totalBrut,
      deductions: totalCharges,
      netAmount: totalNet,
      status: status === 'Draft' ? 'Brouillon' : 'Processed',
      date: new Date().toISOString().split('T')[0],
    };

    // Mettre à jour ou ajouter
    if (existingIndex >= 0) {
      existingPayrolls[existingIndex] = payrollData;
    } else {
      existingPayrolls.unshift(payrollData);
    }

    // Sauvegarder
    saveToLocalStorage('workhub_payrolls', existingPayrolls);

    // Rediriger vers la page Paie
    navigate('/payroll');
  };

  const handleSaveDraft = () => {
    if (window.confirm('Enregistrer cette paie comme brouillon ?')) {
      savePayroll('Draft');
    }
  };

  const handleGeneratePayroll = async () => {
    if (!window.confirm(`Générer la paie pour ${filteredEmployees.length} employés ?\n\nTotal Net: MAD ${totalNet.toLocaleString()}`)) {
      return;
    }

    // Demander l'organizationId et generatedBy (si non connus)
    const defaultOrg = localStorage.getItem('workhub.defaultOrg') || '550e8400-e29b-41d4-a716-446655440000';
    const defaultGen = localStorage.getItem('workhub.defaultGeneratedBy') || '550e8400-e29b-41d4-a716-446655440001';
    const orgId = window.prompt('Organization ID (orgId) :', defaultOrg);
    if (!orgId) { alert('Organization ID requis'); return; }
    const generatedBy = window.prompt('GeneratedBy (user UUID) :', defaultGen);
    if (!generatedBy) { alert('generatedBy requis'); return; }

    // Sauvegarder les valeurs par défaut pour réutilisation
    localStorage.setItem('workhub.defaultOrg', orgId);
    localStorage.setItem('workhub.defaultGeneratedBy', generatedBy);

    // Extraire mois/année depuis selectedMonth (format YYYY-MM)
    const [yearStr, monthStr] = selectedMonth.split('-');
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    try {
      // Récupérer le token Clerk pour l'authentification
      const token = await getToken();
      console.log('Token obtenu:', token ? 'Oui (masqué)' : 'Non');
      
      if (!token) {
        throw new Error('Impossible de récupérer le token d\'authentification. Vérifiez votre connexion Clerk.');
      }
      
      // Appel DIRECT au payroll-service (port 8084) pour éviter les problèmes CORS du gateway
      const url = `http://localhost:8084/api/payrolls/generate?orgId=${encodeURIComponent(orgId)}&month=${month}&year=${year}&generatedBy=${encodeURIComponent(generatedBy)}`;
      console.log('Envoi vers:', url);
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Réponse:', res.status, res.statusText);
      
      if (!res.ok) {
        const txt = await res.text();
        console.error('Réponse d\'erreur:', txt);
        throw new Error(`Erreur ${res.status}: ${txt}`);
      }
      const data = await res.json();
      // Afficher un feedback et sauvegarder localement la paie générée
      alert('✅ Paie générée avec succès (backend).');
      // Optionnel: persister une trace simple côté frontend
      savePayroll('Processed');
      console.log('payroll generated:', data);
    } catch (err: any) {
      console.error('Erreur complète:', err);
      alert('Erreur lors de l\'appel au backend: ' + (err.message || err));
    }
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Génération de la Paie</h1>
          <p className="text-sm text-gray-600 mt-1">Préparez et générez les bulletins de paie mensuels</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Exporter Données
          </button>
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer Brouillon
          </button>
          <button
            onClick={handleGeneratePayroll}
            className="px-6 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Générer la Paie
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="bg-white border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-[#0A6ED1]" />
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Période de Paie</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
              />
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase mb-1">Statut</p>
              <span className="inline-flex px-3 py-1 text-xs bg-orange-100 text-orange-800">
                Brouillon
              </span>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase mb-1">Employés</p>
              <p className="text-lg font-semibold text-gray-900">{employees.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase mb-1">Date Limite</p>
              <p className="text-sm font-medium text-red-600">30 Avril 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-white border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou matricule..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterDept}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterDept(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept === 'Tous' ? 'Tous les départements' : dept}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-600 mr-3">
              {filteredEmployees.length} employé{filteredEmployees.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {selectedEmployees.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">
                {selectedEmployees.length} employé{selectedEmployees.length > 1 ? 's' : ''} sélectionné{selectedEmployees.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={applyBulkBonus}
                className="px-4 py-2 bg-[#0A6ED1] text-white text-sm hover:bg-[#0959b0]"
              >
                Appliquer Prime
              </button>
              <button
                onClick={applyBulkOvertimeHours}
                className="px-4 py-2 bg-green-600 text-white text-sm hover:bg-green-700"
              >
                Ajouter Heures Supp.
              </button>
              <button
                onClick={() => setSelectedEmployees([])}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <Calculator className="w-6 h-6 text-[#0A6ED1]" />
          </div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Salaire Brut Total</h3>
          <p className="text-3xl font-semibold text-gray-900">MAD {totalBrut.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Salaire Net Total</h3>
          <p className="text-3xl font-semibold text-green-600">MAD {totalNet.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Charges Sociales</h3>
          <p className="text-3xl font-semibold text-orange-600">MAD {totalCharges.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Coût Total Employeur</h3>
          <p className="text-3xl font-semibold text-purple-600">MAD {(totalBrut * 1.20).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* Editable Payroll Table */}
      <div className="bg-white border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Détail des Salaires - Avril 2026</h3>
          <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 flex items-center">
            <Plus className="w-4 h-4 mr-1" />
            Ajouter Prime Collective
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-center">
                  <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-200">
                    {selectedEmployees.length === filteredEmployees.length ? (
                      <CheckSquare className="w-5 h-5 text-[#0A6ED1]" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matricule</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Département</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Salaire Brut</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ancienneté</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transport</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase bg-blue-50">Prime Perf.</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Absences</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase bg-blue-50">H. Supp.</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net à Payer</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className={`hover:bg-gray-50 ${selectedEmployees.includes(emp.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-4 text-center">
                    <button onClick={() => toggleSelectEmployee(emp.id)} className="p-1 hover:bg-gray-200">
                      {selectedEmployees.includes(emp.id) ? (
                        <CheckSquare className="w-5 h-5 text-[#0A6ED1]" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{emp.matricule}</td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{emp.nom} {emp.prenom}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{emp.departement}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{emp.poste}</td>
                  <td className="px-4 py-4 text-sm text-right text-gray-900">MAD {emp.salaireBrut.toLocaleString()}</td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600">MAD {emp.anciennete}</td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600">MAD {emp.transport}</td>
                  <td className="px-4 py-4 text-sm text-right bg-blue-50">
                    {editingRow === emp.id ? (
                      <input
                        type="number"
                        defaultValue={emp.primePerf}
                        className="w-20 px-2 py-1 border border-[#0A6ED1] text-right focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                      />
                    ) : (
                      <span className="text-[#0A6ED1] font-medium">MAD {emp.primePerf}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-right">
                    {emp.absences > 0 ? (
                      <span className="text-red-600 font-medium">{emp.absences} j</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-right bg-blue-50">
                    {editingRow === emp.id ? (
                      <input
                        type="number"
                        defaultValue={emp.heuresSupp}
                        className="w-16 px-2 py-1 border border-[#0A6ED1] text-right focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                      />
                    ) : (
                      <span className="text-green-600 font-medium">{emp.heuresSupp} h</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-right">
                    <span className="font-semibold text-gray-900">MAD {calculateNet(emp).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {editingRow === emp.id ? (
                      <button
                        onClick={() => setEditingRow(null)}
                        className="p-1 text-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingRow(emp.id)}
                        className="p-1 text-[#0A6ED1] hover:bg-blue-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td></td>
                <td colSpan={4} className="px-4 py-4 text-sm font-semibold text-gray-900 uppercase">Total Général ({filteredEmployees.length} employés)</td>
                <td className="px-4 py-4 text-sm text-right font-semibold text-gray-900">MAD {filteredEmployees.reduce((s, e) => s + e.salaireBrut, 0).toLocaleString()}</td>
                <td className="px-4 py-4 text-sm text-right font-semibold text-gray-900">MAD {filteredEmployees.reduce((s, e) => s + e.anciennete, 0).toLocaleString()}</td>
                <td className="px-4 py-4 text-sm text-right font-semibold text-gray-900">MAD {filteredEmployees.reduce((s, e) => s + e.transport, 0).toLocaleString()}</td>
                <td className="px-4 py-4 text-sm text-right font-semibold text-[#0A6ED1] bg-blue-50">MAD {filteredEmployees.reduce((s, e) => s + e.primePerf, 0).toLocaleString()}</td>
                <td className="px-4 py-4 text-sm text-right font-semibold text-gray-900">{filteredEmployees.reduce((s, e) => s + e.absences, 0)} j</td>
                <td className="px-4 py-4 text-sm text-right font-semibold text-green-600 bg-blue-50">{filteredEmployees.reduce((s, e) => s + e.heuresSupp, 0)} h</td>
                <td className="px-4 py-4 text-sm text-right font-semibold text-gray-900">MAD {totalNet.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Action Info Box */}
      <div className="bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Instructions de Génération</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Vérifiez les primes de performance et heures supplémentaires avant génération</li>
              <li>• Les absences non justifiées seront déduites automatiquement</li>
              <li>• Les bulletins seront disponibles dans "Gestion des Bulletins" après génération</li>
              <li>• Les employés recevront une notification par email avec leur bulletin en PDF</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
