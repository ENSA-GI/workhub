import { Settings, Save, Upload, FileText, DollarSign, Percent, Calendar, AlertCircle, Plus, Edit2, Trash2, History } from 'lucide-react';
import { useState } from 'react';
import logo from '../../../../imports/Capture_d_écran_2026-04-20_183125-removebg-preview.png';

export default function PayrollSettings() {
  const [activeTab, setActiveTab] = useState('charges');

  const chargesConfig = {
    cnss: { taux: 4.48, base: 'Salaire Brut', description: 'Caisse Nationale de Sécurité Sociale' },
    amo: { taux: 2.26, base: 'Salaire Brut', description: 'Assurance Maladie Obligatoire' },
    cimr: { taux: 6.0, base: 'Salaire Brut', description: 'Caisse Interprofessionnelle Marocaine de Retraite (optionnel)' },
  };

  const taxBrackets = [
    { id: 1, min: 0, max: 2500, taux: 0, description: 'Exonéré' },
    { id: 2, min: 2501, max: 4166, taux: 10, description: 'Tranche 1' },
    { id: 3, min: 4167, max: 5000, taux: 20, description: 'Tranche 2' },
    { id: 4, min: 5001, max: 6666, taux: 30, description: 'Tranche 3' },
    { id: 5, min: 6667, max: 15000, taux: 34, description: 'Tranche 4' },
    { id: 6, min: 15001, max: null, taux: 38, description: 'Tranche 5' },
  ];

  const fixedBonuses = [
    { id: 1, categorie: 'Cadres', anciennete: 'Selon grille', transport: 500, description: 'Prime transport forfaitaire' },
    { id: 2, categorie: 'Agents de Maîtrise', anciennete: 'Selon grille', transport: 400, description: 'Prime transport forfaitaire' },
    { id: 3, categorie: 'Employés', anciennete: 'Selon grille', transport: 300, description: 'Prime transport forfaitaire' },
  ];

  const ancienneteGrid = [
    { id: 1, annees: '2-5 ans', pourcentage: 5 },
    { id: 2, annees: '5-12 ans', pourcentage: 10 },
    { id: 3, annees: '12-20 ans', pourcentage: 15 },
    { id: 4, annees: '20-25 ans', pourcentage: 20 },
    { id: 5, annees: '25+ ans', pourcentage: 25 },
  ];

  const settingsHistory = [
    { id: 1, date: '2026-01-15 10:30', utilisateur: 'Admin Principal', action: 'Mise à jour taux CNSS', detail: '4.29% → 4.48%' },
    { id: 2, date: '2025-12-01 14:20', utilisateur: 'Admin Principal', action: 'Ajout barème IR', detail: 'Nouveau barème 2026' },
    { id: 3, date: '2025-11-10 09:15', utilisateur: 'RH Manager', action: 'Modification primes transport', detail: 'Cadres: MAD 450 → MAD 500' },
  ];

  return (
    <div className="p-6 bg-[#F5F7FA]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Paramètres de Paie</h1>
          <p className="text-sm text-gray-600 mt-1">Configurez les taux, barèmes et modèles de bulletins</p>
        </div>
        <button className="px-6 py-2 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center">
          <Save className="w-4 h-4 mr-2" />
          Enregistrer les Modifications
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('charges')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'charges'
                ? 'border-[#0A6ED1] text-[#0A6ED1]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center">
              <Percent className="w-4 h-4 mr-2" />
              Charges Sociales
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tax'
                ? 'border-[#0A6ED1] text-[#0A6ED1]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Barème IR
            </div>
          </button>
          <button
            onClick={() => setActiveTab('bonuses')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'bonuses'
                ? 'border-[#0A6ED1] text-[#0A6ED1]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Primes Fixes
            </div>
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'template'
                ? 'border-[#0A6ED1] text-[#0A6ED1]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Modèle Bulletin
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-[#0A6ED1] text-[#0A6ED1]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center">
              <History className="w-4 h-4 mr-2" />
              Historique
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Charges Sociales Tab */}
          {activeTab === 'charges' && (
            <div>
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Taux de Cotisations Sociales</h3>
                <div className="space-y-4">
                  {Object.entries(chargesConfig).map(([key, config]) => (
                    <div key={key} className="bg-gray-50 border border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Percent className="w-5 h-5 text-[#0A6ED1] mr-2" />
                            <h4 className="text-sm font-semibold text-gray-900 uppercase">{key.toUpperCase()}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Taux Part Salarié (%)</label>
                              <input
                                type="number"
                                step="0.01"
                                defaultValue={config.taux}
                                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Base de Calcul</label>
                              <select className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]">
                                <option>{config.base}</option>
                                <option>Salaire Net</option>
                                <option>Salaire Imposable</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Information Importante</h4>
                    <p className="text-sm text-blue-800">
                      Les taux de cotisation sont définis par la législation marocaine. Toute modification doit être validée par votre expert comptable ou conseiller juridique avant application.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tax Brackets Tab */}
          {activeTab === 'tax' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Barème de l'Impôt sur le Revenu (IR) - 2026</h3>
                <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 flex items-center">
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter Tranche
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tranche</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Minimum (MAD)</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Maximum (MAD)</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Taux (%)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {taxBrackets.map((bracket, index) => (
                      <tr key={bracket.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Tranche {index + 1}</td>
                        <td className="px-6 py-4 text-sm text-right text-gray-900">{bracket.min.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-right text-gray-900">
                          {bracket.max ? bracket.max.toLocaleString() : 'Illimité'}
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium ${
                            bracket.taux === 0
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {bracket.taux}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{bracket.description}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button className="p-1 text-[#0A6ED1] hover:bg-blue-50">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {index > 0 && (
                              <button className="p-1 text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 bg-orange-50 border border-orange-200 p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-orange-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-orange-900 mb-1">Barème Officiel 2026</h4>
                    <p className="text-sm text-orange-800">
                      Ce barème est conforme à la loi de finances 2026. Les modifications doivent suivre les mises à jour officielles de la DGI (Direction Générale des Impôts).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bonuses Tab */}
          {activeTab === 'bonuses' && (
            <div>
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Primes et Indemnités Fixes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prime Ancienneté</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transport (MAD)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {fixedBonuses.map((bonus) => (
                        <tr key={bonus.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{bonus.categorie}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{bonus.anciennete}</td>
                          <td className="px-6 py-4 text-sm text-right text-gray-900">MAD {bonus.transport}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{bonus.description}</td>
                          <td className="px-6 py-4 text-center">
                            <button className="p-1 text-[#0A6ED1] hover:bg-blue-50">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Grille Prime d'Ancienneté</h3>
                <div className="bg-gray-50 border border-gray-200 p-6">
                  <div className="space-y-3">
                    {ancienneteGrid.map((grid) => (
                      <div key={grid.id} className="flex items-center justify-between p-3 bg-white border border-gray-200">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-[#0A6ED1] mr-3" />
                          <span className="text-sm font-medium text-gray-900">{grid.annees}</span>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="number"
                            defaultValue={grid.pourcentage}
                            className="w-20 px-3 py-1 border border-gray-300 text-right focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                          />
                          <span className="ml-2 text-sm text-gray-600">% du salaire de base</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Template Tab */}
          {activeTab === 'template' && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Modèle de Bulletin de Paie</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Logo de l'Entreprise</h4>
                  <div className="border-2 border-dashed border-gray-300 p-8 text-center hover:border-[#0A6ED1] cursor-pointer mb-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-1">Cliquez pour télécharger ou glissez-déposez</p>
                    <p className="text-xs text-gray-500">PNG, JPG (max 2MB, 300x100px recommandé)</p>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 mb-2">Logo actuel :</p>
                    <div className="flex items-center">
                      <img
                        src={logo}
                        alt="Logo"
                        className="h-12"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Informations de l'Entreprise</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Raison Sociale</label>
                      <input
                        type="text"
                        defaultValue="TechVision SARL"
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Adresse</label>
                      <input
                        type="text"
                        defaultValue="123 Boulevard Zerktouni, Casablanca"
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase mb-1">ICE</label>
                      <input
                        type="text"
                        defaultValue="001234567891234"
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase mb-1">CNSS Affiliation</label>
                      <input
                        type="text"
                        defaultValue="1234567"
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 p-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Options de Format</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Langue du Bulletin</label>
                    <select className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]">
                      <option>Français</option>
                      <option>Arabe</option>
                      <option>Bilingue (FR/AR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Format de Date</label>
                    <select className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]">
                      <option>JJ/MM/AAAA</option>
                      <option>AAAA-MM-JJ</option>
                      <option>JJ Mois AAAA</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm text-gray-700">Afficher le QR Code sur le bulletin</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm text-gray-700">Inclure le détail des jours travaillés</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">Afficher le cumul annuel (YTD)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Historique des Modifications</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Heure</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Détail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {settingsHistory.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(entry.date).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{entry.utilisateur}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{entry.action}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{entry.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start">
          <Settings className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Important</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Toute modification des paramètres de paie s'appliquera aux prochains bulletins générés</li>
              <li>• Les bulletins déjà générés ne seront pas affectés par les changements</li>
              <li>• Les modifications sont enregistrées dans l'historique avec la date et l'utilisateur</li>
              <li>• Consultez votre expert comptable avant de modifier les taux de cotisation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
