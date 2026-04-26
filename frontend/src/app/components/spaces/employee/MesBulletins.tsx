import { Download, Eye, FileText, Search, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function MesBulletins() {
  const [selectedBulletin, setSelectedBulletin] = useState<number | null>(1);

  const bulletins = [
    {
      id: 1,
      mois: 'Avril 2026',
      salaireBrut: 6500,
      anciennete: 450,
      transport: 500,
      primes: 0,
      cnss: 336,
      amo: 169,
      ir: 650,
      salaireNet: 6295,
      date: '2026-04-30'
    },
    {
      id: 2,
      mois: 'Mars 2026',
      salaireBrut: 6500,
      anciennete: 450,
      transport: 500,
      primes: 0,
      cnss: 336,
      amo: 169,
      ir: 650,
      salaireNet: 6295,
      date: '2026-03-31'
    },
    {
      id: 3,
      mois: 'Février 2026',
      salaireBrut: 6500,
      anciennete: 450,
      transport: 500,
      primes: 0,
      cnss: 336,
      amo: 169,
      ir: 650,
      salaireNet: 6295,
      date: '2026-02-28'
    },
    {
      id: 4,
      mois: 'Janvier 2026',
      salaireBrut: 6500,
      anciennete: 450,
      transport: 500,
      primes: 500,
      cnss: 358,
      amo: 180,
      ir: 695,
      salaireNet: 6717,
      date: '2026-01-31'
    },
    {
      id: 5,
      mois: 'Décembre 2025',
      salaireBrut: 6500,
      anciennete: 450,
      transport: 500,
      primes: 1000,
      cnss: 380,
      amo: 191,
      ir: 745,
      salaireNet: 7134,
      date: '2025-12-31'
    },
  ];

  const bulletinDetail = selectedBulletin
    ? bulletins.find((b) => b.id === selectedBulletin)
    : null;

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Mes Bulletins de Paie</h1>
        <p className="text-sm text-gray-600 mt-1">Consultez et téléchargez vos bulletins de paie</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des Bulletins */}
        <div className="lg:col-span-2 bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Historique des Bulletins</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salaire Brut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salaire Net</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Primes</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bulletins.map((bulletin) => (
                  <tr
                    key={bulletin.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedBulletin === bulletin.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedBulletin(bulletin.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-[#0A6ED1] mr-2" />
                        <span className="text-sm font-medium text-gray-900">{bulletin.mois}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">MAD {bulletin.salaireBrut.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">MAD {bulletin.salaireNet.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {bulletin.primes > 0 ? `MAD ${bulletin.primes.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBulletin(bulletin.id);
                          }}
                          className="p-1 hover:bg-blue-50 text-blue-600"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 hover:bg-green-50 text-green-600"
                          title="Télécharger PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Détail du Bulletin Sélectionné */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Détail du Bulletin</h3>
          </div>
          <div className="p-6">
            {bulletinDetail ? (
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">{bulletinDetail.mois}</h4>
                  <p className="text-xs text-gray-500">
                    Généré le {new Date(bulletinDetail.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Gains</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Salaire de Base</span>
                        <span className="text-sm font-medium text-gray-900">MAD {bulletinDetail.salaireBrut.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Prime Ancienneté</span>
                        <span className="text-sm font-medium text-gray-900">MAD {bulletinDetail.anciennete.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Indemnité Transport</span>
                        <span className="text-sm font-medium text-gray-900">MAD {bulletinDetail.transport.toLocaleString()}</span>
                      </div>
                      {bulletinDetail.primes > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Prime Performance</span>
                          <span className="text-sm font-medium text-green-600">MAD {bulletinDetail.primes.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-sm font-medium text-gray-900">Total Brut</span>
                        <span className="text-sm font-semibold text-gray-900">MAD {(bulletinDetail.salaireBrut + bulletinDetail.anciennete + bulletinDetail.transport + bulletinDetail.primes).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Retenues</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">CNSS (4.48%)</span>
                        <span className="text-sm font-medium text-red-600">-MAD {bulletinDetail.cnss.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">AMO (2.26%)</span>
                        <span className="text-sm font-medium text-red-600">-MAD {bulletinDetail.amo.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Impôt sur le Revenu</span>
                        <span className="text-sm font-medium text-red-600">-MAD {bulletinDetail.ir.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-sm font-medium text-gray-900">Total Retenues</span>
                        <span className="text-sm font-semibold text-red-600">-MAD {(bulletinDetail.cnss + bulletinDetail.amo + bulletinDetail.ir).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-3 border-t-2 border-gray-300 bg-blue-50 -mx-6 px-6 py-3">
                    <span className="text-sm font-bold text-gray-900 uppercase">Net à Payer</span>
                    <span className="text-xl font-bold text-[#0A6ED1]">MAD {bulletinDetail.salaireNet.toLocaleString()}</span>
                  </div>
                </div>

                <button className="w-full px-4 py-3 bg-[#0A6ED1] text-white hover:bg-[#0959b0] flex items-center justify-center mt-6">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger PDF
                </button>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200">
                  <p className="text-xs text-blue-800">
                    Vous recevrez une notification par email à chaque nouveau bulletin disponible.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-600">Sélectionnez un bulletin pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistiques Annuelles */}
      <div className="mt-6 bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center">
          <Calendar className="w-5 h-5 text-[#0A6ED1] mr-2" />
          <h3 className="text-base font-semibold text-gray-900">Récapitulatif 2026 (YTD)</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 border border-gray-200 p-4">
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
                <p className="text-xs text-gray-500 uppercase font-medium">Total Brut</p>
              </div>
              <p className="text-2xl font-semibold text-gray-900">MAD {bulletins.slice(0, 4).reduce((sum, b) => sum + b.salaireBrut + b.anciennete + b.transport + b.primes, 0).toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-1">4 mois</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-xs text-gray-500 uppercase font-medium">Total Retenues</p>
              </div>
              <p className="text-2xl font-semibold text-red-600">MAD {bulletins.slice(0, 4).reduce((sum, b) => sum + b.cnss + b.amo + b.ir, 0).toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-1">Charges sociales</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4">
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-xs text-gray-500 uppercase font-medium">Total Primes</p>
              </div>
              <p className="text-2xl font-semibold text-green-600">MAD {bulletins.slice(0, 4).reduce((sum, b) => sum + b.primes, 0).toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-1">Bonus reçus</p>
            </div>
            <div className="bg-blue-50 border border-[#0A6ED1] p-4">
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 text-[#0A6ED1] mr-2" />
                <p className="text-xs text-gray-500 uppercase font-medium">Total Net</p>
              </div>
              <p className="text-2xl font-semibold text-[#0A6ED1]">MAD {bulletins.slice(0, 4).reduce((sum, b) => sum + b.salaireNet, 0).toLocaleString()}</p>
              <p className="text-xs text-blue-600 mt-1">Net perçu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
