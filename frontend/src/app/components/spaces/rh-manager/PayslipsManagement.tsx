import { FileText, Download, Mail, Search, Filter, Eye, CheckCircle, Clock, Calendar, DollarSign, Users, Send, CheckSquare, Square } from 'lucide-react';
import { useState } from 'react';

export default function PayslipsManagement() {
  const [selectedPayslip, setSelectedPayslip] = useState<number | null>(1);
  const [filterMonth, setFilterMonth] = useState('2026-04');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayslips, setSelectedPayslips] = useState<number[]>([]);

  const payslips = [
    { id: 1, employeId: 'EMP001', nom: 'Alami Mohammed', departement: 'IT', poste: 'Développeur Senior', mois: '2026-04', salaireBrut: 13350, salaireNet: 10234, statut: 'Envoyé', dateEnvoi: '2026-04-30 14:30', lu: true },
    { id: 2, employeId: 'EMP002', nom: 'Bennani Sara', departement: 'IT', poste: 'Chef de Projet', mois: '2026-04', salaireBrut: 16700, salaireNet: 12805, statut: 'Envoyé', dateEnvoi: '2026-04-30 14:30', lu: true },
    { id: 3, employeId: 'EMP003', nom: 'Zahra Fatima', departement: 'RH', poste: 'Analyste RH', mois: '2026-04', salaireBrut: 9950, salaireNet: 7626, statut: 'Envoyé', dateEnvoi: '2026-04-30 14:30', lu: false },
    { id: 4, employeId: 'EMP004', nom: 'Alaoui Karim', departement: 'Ventes', poste: 'Commercial Senior', mois: '2026-04', salaireBrut: 9350, salaireNet: 7021, statut: 'En attente', dateEnvoi: null, lu: false },
    { id: 5, employeId: 'EMP005', nom: 'Idrissi Amina', departement: 'Finance', poste: 'Comptable', mois: '2026-04', salaireBrut: 11850, salaireNet: 9085, statut: 'Envoyé', dateEnvoi: '2026-04-30 14:30', lu: true },
    { id: 6, employeId: 'EMP006', nom: 'El Fassi Youssef', departement: 'IT', poste: 'Développeur', mois: '2026-04', salaireBrut: 10925, salaireNet: 8373, statut: 'Envoyé', dateEnvoi: '2026-04-30 14:30', lu: true },
    { id: 7, employeId: 'EMP007', nom: 'Tazi Nadia', departement: 'Marketing', poste: 'Chef Marketing', mois: '2026-04', salaireBrut: 12300, salaireNet: 9427, statut: 'Envoyé', dateEnvoi: '2026-04-30 14:30', lu: false },
    { id: 8, employeId: 'EMP008', nom: 'Berrada Hassan', departement: 'Ventes', poste: 'Commercial', mois: '2026-04', salaireBrut: 8400, salaireNet: 6438, statut: 'En attente', dateEnvoi: null, lu: false },
    { id: 9, employeId: 'EMP009', nom: 'Alami Zineb', departement: 'RH', poste: 'RH Manager', mois: '2026-04', salaireBrut: 14500, salaireNet: 11116, statut: 'Envoyé', dateEnvoi: '2026-04-30 14:30', lu: true },
    { id: 10, employeId: 'EMP010', nom: 'Bennani Omar', departement: 'IT', poste: 'DevOps Engineer', mois: '2026-04', salaireBrut: 13900, salaireNet: 10657, statut: 'Envoyé', dateEnvoi: '2026-04-30 14:30', lu: true },
    { id: 11, employeId: 'EMP011', nom: 'Chakir Leila', departement: 'Finance', poste: 'Analyste Financier', mois: '2026-04', salaireBrut: 9850, salaireNet: 7549, statut: 'En attente', dateEnvoi: null, lu: false },
    { id: 12, employeId: 'EMP012', nom: 'El Idrissi Ahmed', departement: 'IT', poste: 'Développeur Junior', mois: '2026-04', salaireBrut: 7400, salaireNet: 5671, statut: 'Envoyé', dateEnvoi: '2026-04-30 14:30', lu: false },
    { id: 13, employeId: 'EMP013', nom: 'Fassi Sanaa', departement: 'Marketing', poste: 'Social Media Manager', mois: '2026-04', salaireBrut: 8750, salaireNet: 6706, statut: 'Envoyé', dateEnvoi: '2026-04-30 14:30', lu: true },
    { id: 14, employeId: 'EMP014', nom: 'Tazi Mehdi', departement: 'Ventes', poste: 'Responsable Commercial', mois: '2026-04', salaireBrut: 13400, salaireNet: 10273, statut: 'Envoyé', dateEnvoi: '2026-04-30 14:30', lu: true },
    { id: 15, employeId: 'EMP015', nom: 'Alaoui Rachid', departement: 'IT', poste: 'Tech Lead', mois: '2026-04', salaireBrut: 17900, salaireNet: 13724, statut: 'Envoyé', dateEnvoi: '2026-04-30 14:30', lu: true },
    { id: 16, employeId: 'EMP016', nom: 'Benjelloun Imane', departement: 'Finance', poste: 'Contrôleur de Gestion', mois: '2026-04', salaireBrut: 11650, salaireNet: 8932, statut: 'En attente', dateEnvoi: null, lu: false },
    { id: 17, employeId: 'EMP017', nom: 'Chraibi Kamal', departement: 'Ventes', poste: 'Commercial', mois: '2026-04', salaireBrut: 8200, salaireNet: 6284, statut: 'Envoyé', dateEnvoi: '2026-04-30 14:30', lu: false },
    { id: 18, employeId: 'EMP018', nom: 'El Amrani Salma', departement: 'RH', poste: 'Assistant RH', mois: '2026-04', salaireBrut: 6800, salaireNet: 5211, statut: 'Envoyé', dateEnvoi: '2026-04-30 14:30', lu: true },
  ];

  const filteredPayslips = payslips.filter(p => {
    const matchSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.employeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'Tous' || p.statut === filterStatus;
    return matchSearch && matchStatus;
  });

  const selectedPayslipDetail = payslips.find(p => p.id === selectedPayslip);

  const statsEnvoyes = payslips.filter(p => p.statut === 'Envoyé').length;
  const statsLus = payslips.filter(p => p.lu).length;
  const totalNet = payslips.reduce((sum, p) => sum + p.salaireNet, 0);

  const toggleSelectAll = () => {
    if (selectedPayslips.length === filteredPayslips.length) {
      setSelectedPayslips([]);
    } else {
      setSelectedPayslips(filteredPayslips.map(p => p.id));
    }
  };

  const toggleSelectPayslip = (id: number) => {
    if (selectedPayslips.includes(id)) {
      setSelectedPayslips(selectedPayslips.filter(pid => pid !== id));
    } else {
      setSelectedPayslips([...selectedPayslips, id]);
    }
  };

  const sendSelectedPayslips = () => {
    const count = selectedPayslips.length;
    if (count > 0) {
      alert(`${count} bulletin(s) envoyé(s) par email avec succès`);
      setSelectedPayslips([]);
    }
  };

  const downloadSelectedPayslips = () => {
    const count = selectedPayslips.length;
    if (count > 0) {
      alert(`Téléchargement de ${count} bulletin(s) en cours...`);
    }
  };

  return (
    <div className="p-6 bg-[#F5F7FA]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des Bulletins de Paie</h1>
          <p className="text-sm text-gray-600 mt-1">Consultez, envoyez et téléchargez les bulletins générés</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Télécharger Tout (ZIP)
          </button>
          <button className="px-4 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center">
            <Send className="w-4 h-4 mr-2" />
            Envoyer par Email
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-6 h-6 text-[#0A6ED1]" />
          </div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Bulletins Générés</h3>
          <p className="text-3xl font-semibold text-gray-900">{payslips.length}</p>
          <p className="text-xs text-gray-600 mt-1">Avril 2026</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <Mail className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Envoyés</h3>
          <p className="text-3xl font-semibold text-green-600">{statsEnvoyes}</p>
          <p className="text-xs text-green-600 mt-1">{((statsEnvoyes / payslips.length) * 100).toFixed(0)}% du total</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <Eye className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Consultés</h3>
          <p className="text-3xl font-semibold text-blue-600">{statsLus}</p>
          <p className="text-xs text-blue-600 mt-1">{((statsLus / payslips.length) * 100).toFixed(0)}% des envoyés</p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Montant Net Total</h3>
          <p className="text-3xl font-semibold text-purple-600">MAD {totalNet.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou matricule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
            >
              <option>Tous</option>
              <option>Envoyé</option>
              <option>En attente</option>
            </select>
          </div>
        </div>

        {selectedPayslips.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">
                {selectedPayslips.length} bulletin{selectedPayslips.length > 1 ? 's' : ''} sélectionné{selectedPayslips.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={sendSelectedPayslips}
                className="px-4 py-2 bg-[#0A6ED1] text-white text-sm hover:bg-[#0959b0] flex items-center"
              >
                <Mail className="w-4 h-4 mr-1" />
                Envoyer par Email
              </button>
              <button
                onClick={downloadSelectedPayslips}
                className="px-4 py-2 bg-green-600 text-white text-sm hover:bg-green-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-1" />
                Télécharger ZIP
              </button>
              <button
                onClick={() => setSelectedPayslips([])}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payslips List */}
        <div className="lg:col-span-1 bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Liste des Bulletins ({filteredPayslips.length})</h3>
            <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-200">
              {selectedPayslips.length === filteredPayslips.length && filteredPayslips.length > 0 ? (
                <CheckSquare className="w-5 h-5 text-[#0A6ED1]" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {filteredPayslips.map((payslip) => (
              <div
                key={payslip.id}
                className={`p-4 transition-all ${
                  selectedPayslip === payslip.id
                    ? 'bg-blue-50 border-l-4 border-[#0A6ED1]'
                    : 'hover:bg-gray-50'
                } ${selectedPayslips.includes(payslip.id) ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start mb-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectPayslip(payslip.id);
                    }}
                    className="mr-3 mt-1 p-1 hover:bg-gray-200"
                  >
                    {selectedPayslips.includes(payslip.id) ? (
                      <CheckSquare className="w-5 h-5 text-[#0A6ED1]" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2 cursor-pointer" onClick={() => setSelectedPayslip(payslip.id)}>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{payslip.nom}</p>
                        <p className="text-xs text-gray-600 mt-1">{payslip.employeId} • {payslip.poste}</p>
                      </div>
                      {payslip.statut === 'Envoyé' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3 cursor-pointer" onClick={() => setSelectedPayslip(payslip.id)}>
                      <span className="text-xs font-medium text-gray-900">MAD {payslip.salaireNet.toLocaleString()}</span>
                      <span className={`inline-flex px-2 py-1 text-xs ${
                        payslip.statut === 'Envoyé'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {payslip.statut}
                      </span>
                    </div>
                    {payslip.lu && (
                      <div className="mt-2 pt-2 border-t border-gray-200 cursor-pointer" onClick={() => setSelectedPayslip(payslip.id)}>
                        <p className="text-xs text-blue-600 flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          Consulté
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PDF Preview / Details */}
        <div className="lg:col-span-2 bg-white border border-gray-200">
          {selectedPayslipDetail ? (
            <div>
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Bulletin de Paie - Avril 2026</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedPayslipDetail.nom}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    Prévisualiser
                  </button>
                  <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    Télécharger
                  </button>
                  <button className="px-3 py-1 bg-[#0A6ED1] text-white text-sm hover:bg-[#0959b0] flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Envoyer
                  </button>
                </div>
              </div>

              {/* PDF Preview Mockup */}
              <div className="p-6 bg-gray-50">
                <div className="bg-white border-2 border-gray-300 p-8 shadow-lg max-w-2xl mx-auto">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-300">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">WorkHub</h2>
                      <p className="text-sm text-gray-600">TechVision SARL</p>
                      <p className="text-sm text-gray-600">123 Boulevard Zerktouni</p>
                      <p className="text-sm text-gray-600">Casablanca, Maroc</p>
                    </div>
                    <div className="text-right">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">BULLETIN DE PAIE</h3>
                      <p className="text-sm text-gray-600">Période: Avril 2026</p>
                      <p className="text-sm text-gray-600">Date: 30/04/2026</p>
                    </div>
                  </div>

                  {/* Employee Info */}
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Informations Employé</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Nom Complet</p>
                        <p className="text-sm font-medium text-gray-900">{selectedPayslipDetail.nom}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Matricule</p>
                        <p className="text-sm font-medium text-gray-900">{selectedPayslipDetail.employeId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Poste</p>
                        <p className="text-sm font-medium text-gray-900">{selectedPayslipDetail.poste}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">CNSS</p>
                        <p className="text-sm font-medium text-gray-900">123456789</p>
                      </div>
                    </div>
                  </div>

                  {/* Payroll Details */}
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Détail de la Rémunération</h4>
                    <table className="w-full text-sm">
                      <thead className="border-b border-gray-300">
                        <tr>
                          <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Libellé</th>
                          <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Base</th>
                          <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Montant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="py-2 text-gray-700">Salaire de Base</td>
                          <td className="py-2 text-right text-gray-600">-</td>
                          <td className="py-2 text-right font-medium text-gray-900">MAD 12,000</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-700">Prime d'Ancienneté</td>
                          <td className="py-2 text-right text-gray-600">-</td>
                          <td className="py-2 text-right font-medium text-gray-900">MAD 850</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-700">Indemnité Transport</td>
                          <td className="py-2 text-right text-gray-600">-</td>
                          <td className="py-2 text-right font-medium text-gray-900">MAD 500</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-2 font-semibold text-gray-900">Salaire Brut</td>
                          <td className="py-2 text-right"></td>
                          <td className="py-2 text-right font-semibold text-gray-900">MAD {selectedPayslipDetail.salaireBrut.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Deductions */}
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Retenues</h4>
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="py-2 text-gray-700">CNSS (4.48%)</td>
                          <td className="py-2 text-right text-red-600">- MAD 598</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-700">AMO (2.26%)</td>
                          <td className="py-2 text-right text-red-600">- MAD 302</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-700">Impôt sur le Revenu</td>
                          <td className="py-2 text-right text-red-600">- MAD 2,216</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Net Salary */}
                  <div className="bg-[#0A6ED1] text-white p-4 mt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium uppercase">Net à Payer</span>
                      <span className="text-2xl font-bold">MAD {selectedPayslipDetail.salaireNet.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-8 pt-6 border-t border-gray-300 text-center">
                    <p className="text-xs text-gray-500">Document généré automatiquement par WorkHub le 30/04/2026</p>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              {selectedPayslipDetail.dateEnvoi && (
                <div className="p-4 bg-green-50 border-t border-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Bulletin envoyé avec succès</p>
                      <p className="text-xs text-green-700 mt-1">
                        Envoyé le {new Date(selectedPayslipDetail.dateEnvoi).toLocaleString('fr-FR')} à {selectedPayslipDetail.nom.split(' ')[0].toLowerCase()}@techvision.ma
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Sélectionnez un bulletin pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
