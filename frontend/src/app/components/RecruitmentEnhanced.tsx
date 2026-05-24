import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, TrendingUp, User, FileText, Calendar, Star, Download, Trash2, RefreshCw } from 'lucide-react';
import JobPostingForm from './JobPostingForm';
import NotificationToast from './NotificationToast';
import { exportToCSV } from '../utils/dataManager';

const API_BASE = 'http://localhost:8085/api';

interface JobPosting {
  id: string;
  title: string;
  department: string;
  openings: number;
  applicants: number;
  status: string;
  description?: string;
  requirements?: string;
}

interface Candidate {
  id: string;
  name: string;
  position: string;
  score: number;
  status: string;
  appliedDate: string;
  experience: string;
  location: string;
  skills: string[];
  email?: string;
  phone?: string;
  cvUrl?: string;
  applicationId?: string;
  aiSummary?: string;
}

export default function RecruitmentEnhanced() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, visible: true });
  };

  const fetchRecruitmentData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/job-offers/public`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const mappedJobs: JobPosting[] = data.map((job: any) => ({
        id: job.id,
        title: job.title,
        department: job.location || 'N/A',
        openings: job.minExperience || 1,
        applicants: job.applications?.length || 0,
        status: job.status === 'PUBLISHED' ? 'Active' : 'Draft',
        description: job.description,
      }));
      setJobs(mappedJobs);

      const allCandidates: Candidate[] = [];
      data.forEach((job: any) => {
        if (job.applications) {
          job.applications.forEach((app: any) => {
            allCandidates.push({
              id: app.candidateId,
              applicationId: app.id,
              name: app.candidateFullName || 'Candidat',
              position: job.title,
              score: app.aiScore ? Number(app.aiScore) : 0,
              status: mapStatus(app.status),
              appliedDate: app.appliedAt
                ? new Date(app.appliedAt * 1000).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
              experience: app.extractedExperience ? `${app.extractedExperience} ans` : 'N/A',
              location: 'Maroc',
              skills: app.extractedSkills ? JSON.parse(app.extractedSkills) : [],
              cvUrl: app.cvUrl,
              aiSummary: app.aiSummary,
            });
          });
        }
      });

      allCandidates.sort((a, b) => b.score - a.score);
      setCandidates(allCandidates);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      showNotification('Erreur de connexion au serveur', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecruitmentData();
  }, [fetchRecruitmentData]);

  const mapStatus = (apiStatus: string): string => {
    const map: Record<string, string> = {
      NEW: 'Review',
      IN_REVIEW: 'Review',
      PRESELECTED: 'Preselected',
      INTERVIEW_SCHEDULED: 'Interview',
      REJECTED: 'Rejected',
      HIRED: 'Accepted',
    };
    return map[apiStatus] || apiStatus;
  };

  // ─── Créer une offre ─────────────────────────────────────────────────────────
  const handleSaveJob = async (jobData: Partial<JobPosting>) => {
    try {
      const response = await fetch(`${API_BASE}/job-offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: '550e8400-e29b-41d4-a716-446655440000',
          createdBy: '880e8400-e29b-41d4-a716-446655440000',
          title: jobData.title,
          description: jobData.description,
          location: jobData.department,
          minExperience: jobData.openings || 0,
          contractType: 'CDI',
          status: 'PUBLISHED',
          requiredSkills: JSON.stringify([jobData.requirements]),
        }),
      });
      if (!response.ok) throw new Error('Failed to post job');
      const saved = await response.json();
      setJobs(prev => [...prev, {
        id: saved.id,
        title: saved.title,
        department: saved.location || 'N/A',
        openings: saved.minExperience || 1,
        applicants: 0,
        status: 'Active',
        description: saved.description,
      }]);
      showNotification('Offre publiée avec succès ✓', 'success');
    } catch {
      showNotification("Erreur lors de la création de l'offre", 'error');
    }
  };

  // ─── Supprimer une offre ──────────────────────────────────────────────────────
  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('Supprimer cette offre et toutes ses candidatures ?')) return;
    try {
      const res = await fetch(`${API_BASE}/job-offers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setJobs(prev => prev.filter(j => j.id !== id));
      setCandidates(prev => prev.filter(c => {
        const job = jobs.find(j => j.id === id);
        return !(job && c.position === job.title);
      }));
      showNotification('Offre supprimée', 'success');
    } catch {
      showNotification("Erreur lors de la suppression", 'error');
    }
  };

  // ─── Changer le statut d'une candidature ─────────────────────────────────────
  const updateStatus = async (applicationId: string, apiStatus: string, uiLabel: string) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${applicationId}/status?status=${apiStatus}`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error();
      setCandidates(prev => prev.map(c =>
        c.applicationId === applicationId ? { ...c, status: uiLabel } : c
      ));
      showNotification(`Statut mis à jour : ${uiLabel}`, 'success');
    } catch {
      showNotification('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const handleAcceptCandidate = (applicationId: string) =>
    updateStatus(applicationId, 'HIRED', 'Accepted');

  const handleRejectCandidate = (applicationId: string) =>
    updateStatus(applicationId, 'REJECTED', 'Rejected');

  const handleScheduleInterview = (applicationId: string) =>
    updateStatus(applicationId, 'INTERVIEW_SCHEDULED', 'Interview');

  // ─── Voir le CV ───────────────────────────────────────────────────────────────
  const handleViewCv = async (applicationId: string) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${applicationId}/cv`);
      if (!res.ok) throw new Error();
      const url = await res.text(); // URL signée MinIO retournée en texte brut
      window.open(url, '_blank');
    } catch {
      showNotification("Impossible d'ouvrir le CV", 'error');
    }
  };

  // ─── Export ───────────────────────────────────────────────────────────────────
  const handleExportJobs = () => { exportToCSV(jobs, 'offres_emploi'); showNotification('Export réussi', 'success'); };
  const handleExportCandidates = () => { exportToCSV(candidates, 'candidats'); showNotification('Export réussi', 'success'); };

  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCand = candidates.find(c => c.applicationId === selectedCandidate);

  const statusBadge = (status: string) => {
    const classes: Record<string, string> = {
      Interview: 'bg-blue-100 text-blue-800',
      Review: 'bg-orange-100 text-orange-800',
      Accepted: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      Preselected: 'bg-purple-100 text-purple-800',
    };
    return `inline-flex px-2 py-1 text-xs rounded font-medium ${classes[status] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <div className="p-6">
      <NotificationToast
        message={notification.message}
        type={notification.type}
        isVisible={notification.visible}
        onClose={() => setNotification({ ...notification, visible: false })}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Recrutement</h1>
          <p className="text-sm text-gray-600 mt-1">Gestion des offres et candidatures en temps réel</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchRecruitmentData}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={handleExportCandidates}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setIsJobFormOpen(true)}
            className="px-4 py-2 bg-[#0A6ED1] text-white rounded hover:bg-[#0959b0] flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </button>
        </div>
      </div>

      {/* Offres actives */}
      <div className="bg-white rounded border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            Active Job Openings
            <span className="ml-2 text-sm text-gray-400 font-normal">({jobs.length})</span>
          </h3>
          <button onClick={handleExportJobs} className="text-sm text-[#0A6ED1] hover:underline flex items-center">
            <Download className="w-4 h-4 mr-1" /> Export Jobs
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            {isLoading ? 'Chargement...' : 'Aucune offre active. Créez votre première offre !'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            {jobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded p-4 hover:border-[#0A6ED1] transition-colors relative group">
                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded text-red-500 transition-opacity"
                  title="Supprimer cette offre"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <h4 className="text-sm font-semibold text-gray-900 mb-1 pr-8">{job.title}</h4>
                <p className="text-xs text-[#0A6ED1] mb-3">{job.department}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{job.openings} an(s) exp. min</span>
                  <span className="text-[#0A6ED1] font-semibold">{job.applicants} candidats</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidats + Profil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table candidats */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Candidats
                <span className="ml-2 text-sm text-gray-400 font-normal">({filteredCandidates.length})</span>
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] focus:border-transparent"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredCandidates.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  {isLoading ? 'Chargement...' : 'Aucun candidat trouvé.'}
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidat</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCandidates.map((candidate) => (
                      <tr
                        key={candidate.applicationId}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedCandidate === candidate.applicationId ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedCandidate(candidate.applicationId ?? null)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#0A6ED1] flex items-center justify-center text-white text-sm font-medium mr-3 flex-shrink-0">
                              {candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                              <p className="text-xs text-gray-500">{candidate.experience}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-[150px] truncate">{candidate.position}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <TrendingUp className={`w-4 h-4 mr-1 ${candidate.score >= 70 ? 'text-green-600' : candidate.score >= 40 ? 'text-yellow-500' : 'text-red-400'}`} />
                            <span className="text-sm font-medium text-gray-900">{Math.round(candidate.score)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={statusBadge(candidate.status)}>{candidate.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2" onClick={e => e.stopPropagation()}>
                            {candidate.status !== 'Accepted' && candidate.status !== 'Rejected' && (
                              <>
                                <button
                                  onClick={() => handleAcceptCandidate(candidate.applicationId!)}
                                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRejectCandidate(candidate.applicationId!)}
                                  className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Panneau profil */}
        <div className="lg:col-span-1">
          {selectedCand ? (
            <div className="bg-white rounded border border-gray-200 p-6 sticky top-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Profil Candidat</h3>

              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-[#0A6ED1] flex items-center justify-center text-white text-2xl font-bold mb-3">
                  {selectedCand.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 text-center">{selectedCand.name}</h4>
                <p className="text-sm text-gray-500 text-center">{selectedCand.position}</p>
                <span className={`mt-2 ${statusBadge(selectedCand.status)}`}>{selectedCand.status}</span>
              </div>

              {/* Score IA */}
              <div className="mb-5">
                <label className="text-xs text-gray-500 uppercase mb-2 flex items-center">
                  <Star className="w-3 h-3 mr-1 text-yellow-500" />
                  Score IA
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        selectedCand.score >= 70 ? 'bg-green-500' :
                        selectedCand.score >= 40 ? 'bg-yellow-500' : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.min(selectedCand.score, 100)}%` }}
                    />
                  </div>
                  <span className="text-lg font-semibold text-gray-900 w-12 text-right">
                    {Math.round(selectedCand.score)}%
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-xs text-gray-500 uppercase flex items-center mb-1">
                    <User className="w-3 h-3 mr-1" /> Expérience
                  </label>
                  <p className="text-gray-900">{selectedCand.experience}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase flex items-center mb-1">
                    <Calendar className="w-3 h-3 mr-1" /> Date de candidature
                  </label>
                  <p className="text-gray-900">
                    {new Date(selectedCand.appliedDate).toLocaleDateString('fr-FR', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                {selectedCand.aiSummary && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase mb-2 block">Analyse IA</label>
                    <p className="text-xs text-gray-600 bg-blue-50 p-3 rounded italic border-l-4 border-[#0A6ED1] leading-relaxed">
                      {selectedCand.aiSummary}
                    </p>
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="mt-6 pt-5 border-t border-gray-100 space-y-2">
                {selectedCand.cvUrl && (
                  <button
                    onClick={() => handleViewCv(selectedCand.applicationId!)}
                    className="w-full px-4 py-2 bg-[#0A6ED1] text-white rounded hover:bg-[#0959b0] flex items-center justify-center transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Voir le CV
                  </button>
                )}
                {selectedCand.status !== 'Interview' && selectedCand.status !== 'Accepted' && selectedCand.status !== 'Rejected' && (
                  <button
                    onClick={() => handleScheduleInterview(selectedCand.applicationId!)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center justify-center transition-colors"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Planifier entretien
                  </button>
                )}
                {selectedCand.status !== 'Accepted' && selectedCand.status !== 'Rejected' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAcceptCandidate(selectedCand.applicationId!)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition-colors"
                    >
                      ✓ Accepter
                    </button>
                    <button
                      onClick={() => handleRejectCandidate(selectedCand.applicationId!)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 text-sm transition-colors"
                    >
                      ✗ Rejeter
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded border border-gray-200 p-6 flex items-center justify-center h-64">
              <p className="text-sm text-gray-400">Sélectionnez un candidat pour voir son profil</p>
            </div>
          )}
        </div>
      </div>

      <JobPostingForm
        isOpen={isJobFormOpen}
        onClose={() => setIsJobFormOpen(false)}
        onSave={handleSaveJob}
      />
    </div>
  );
}
