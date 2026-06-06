import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, TrendingUp, User, FileText, Calendar, Star, Download, Trash2, RefreshCw, Activity, CheckCircle, XCircle, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

  const handleAcceptCandidate = (applicationId: string) => updateStatus(applicationId, 'HIRED', 'Accepted');
  const handleRejectCandidate = (applicationId: string) => updateStatus(applicationId, 'REJECTED', 'Rejected');
  const handleScheduleInterview = (applicationId: string) => updateStatus(applicationId, 'INTERVIEW_SCHEDULED', 'Interview');

  const handleViewCv = async (applicationId: string) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${applicationId}/cv`);
      if (!res.ok) throw new Error();
      const url = await res.text();
      window.open(url, '_blank');
    } catch {
      showNotification("Impossible d'ouvrir le CV", 'error');
    }
  };

  const handleExportJobs = () => { exportToCSV(jobs, 'offres_emploi'); showNotification('Export réussi', 'success'); };
  const handleExportCandidates = () => { exportToCSV(candidates, 'candidats'); showNotification('Export réussi', 'success'); };

  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCand = candidates.find(c => c.applicationId === selectedCandidate);

  const statusBadge = (status: string) => {
    const classes: Record<string, string> = {
      Interview: 'bg-blue-100 text-blue-700 border-blue-200',
      Review: 'bg-orange-100 text-orange-700 border-orange-200',
      Accepted: 'bg-green-100 text-green-700 border-green-200',
      Rejected: 'bg-red-100 text-red-700 border-red-200',
      Preselected: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return `inline-flex px-3 py-1 text-xs rounded-full font-medium border ${classes[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`;
  };

  return (
    <div className="p-6 pb-24">
      <NotificationToast
        message={notification.message}
        type={notification.type}
        isVisible={notification.visible}
        onClose={() => setNotification({ ...notification, visible: false })}
      />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Recrutement & IA</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion des offres et matching intelligent des candidatures</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchRecruitmentData}
            disabled={isLoading}
            className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 text-gray-700 rounded-xl hover:bg-white flex items-center shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={handleExportCandidates}
            className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 text-gray-700 rounded-xl hover:bg-white flex items-center shadow-sm transition-all"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setIsJobFormOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#0A6ED1] to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 flex items-center transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer une Offre
          </button>
        </div>
      </motion.div>

      {/* Offres actives */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-3xl overflow-hidden mb-8"
      >
        <div className="p-5 border-b border-gray-100/50 bg-white/40 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            Offres Actives
            <span className="ml-3 px-2.5 py-0.5 bg-[#0A6ED1]/10 text-[#0A6ED1] rounded-full text-sm font-semibold">{jobs.length}</span>
          </h3>
          <button onClick={handleExportJobs} className="text-sm text-[#0A6ED1] hover:text-blue-600 font-medium flex items-center transition-colors">
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-[#0A6ED1]/50" />
            </div>
            <p className="text-gray-500 font-medium">{isLoading ? 'Chargement des offres...' : 'Aucune offre active. Créez votre première offre !'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-white/20">
            <AnimatePresence>
              {jobs.map((job) => (
                <motion.div 
                  key={job.id} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/60 border border-gray-100 rounded-2xl p-5 hover:border-[#0A6ED1]/30 hover:shadow-lg transition-all relative group"
                >
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 transition-all"
                    title="Supprimer cette offre"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                    <TrendingUp className="w-5 h-5 text-[#0A6ED1]" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-1 pr-8 truncate">{job.title}</h4>
                  <p className="text-sm text-[#0A6ED1] mb-4 font-medium">{job.department}</p>
                  <div className="flex items-center justify-between text-xs pt-4 border-t border-gray-100">
                    <span className="text-gray-500 bg-gray-50 px-2 py-1 rounded-md">{job.openings} an(s) exp. min</span>
                    <span className="text-[#0A6ED1] font-bold bg-blue-50 px-2 py-1 rounded-md">{job.applicants} candidats</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Candidats + Profil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table candidats */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card rounded-3xl overflow-hidden flex flex-col"
        >
          <div className="p-5 border-b border-gray-100/50 bg-white/40 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              Vivier de Candidats
              <span className="ml-3 px-2.5 py-0.5 bg-[#0A6ED1]/10 text-[#0A6ED1] rounded-full text-sm font-semibold">{filteredCandidates.length}</span>
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un candidat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-64 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/50 focus:border-transparent transition-shadow shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1 bg-white/20">
            {filteredCandidates.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <UsersIcon className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">{isLoading ? 'Recherche en cours...' : 'Aucun candidat trouvé.'}</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/40 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-2xl">Candidat</th>
                    <th className="px-6 py-4">Poste ciblé</th>
                    <th className="px-6 py-4 flex items-center"><BrainCircuit className="w-4 h-4 mr-1 text-purple-500"/> Match IA</th>
                    <th className="px-6 py-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCandidates.map((candidate) => (
                    <tr
                      key={candidate.applicationId}
                      className={`hover:bg-white/60 cursor-pointer transition-all ${selectedCandidate === candidate.applicationId ? 'bg-blue-50/50 shadow-sm' : ''}`}
                      onClick={() => setSelectedCandidate(candidate.applicationId ?? null)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold mr-4 flex-shrink-0 shadow-sm ${selectedCandidate === candidate.applicationId ? 'bg-gradient-to-tr from-[#0A6ED1] to-blue-400' : 'bg-gray-400'}`}>
                            {candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 mb-0.5">{candidate.name}</p>
                            <p className="text-xs text-gray-500 flex items-center"><Calendar className="w-3 h-3 mr-1"/> {candidate.experience}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700 max-w-[150px] truncate">{candidate.position}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mr-3 max-w-[60px]">
                            <div className={`h-1.5 rounded-full ${candidate.score >= 70 ? 'bg-green-500' : candidate.score >= 40 ? 'bg-yellow-500' : 'bg-red-400'}`} style={{ width: `${Math.min(candidate.score, 100)}%` }}></div>
                          </div>
                          <span className={`text-sm font-bold ${candidate.score >= 70 ? 'text-green-600' : candidate.score >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>{Math.round(candidate.score)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={statusBadge(candidate.status)}>{candidate.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Panneau profil */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          {selectedCand ? (
            <div className="glass-card rounded-3xl p-6 sticky top-6 shadow-xl border border-white">
              <div className="absolute top-0 right-0 p-4">
                <span className={statusBadge(selectedCand.status)}>{selectedCand.status}</span>
              </div>
              
              <div className="flex flex-col items-center mb-8 mt-4">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#0A6ED1] to-purple-500 flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg ring-4 ring-white/50">
                  {selectedCand.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <h4 className="text-xl font-bold text-gray-900 text-center">{selectedCand.name}</h4>
                <p className="text-sm font-medium text-[#0A6ED1] text-center mt-1">{selectedCand.position}</p>
              </div>

              {/* Score IA */}
              <div className="mb-8 p-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                  <BrainCircuit className="w-4 h-4 mr-2 text-purple-500" />
                  Score de Matching IA
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 shadow-inner overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(selectedCand.score, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        selectedCand.score >= 70 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        selectedCand.score >= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gradient-to-r from-red-400 to-red-500'
                      }`}
                    />
                  </div>
                  <span className="text-2xl font-black text-gray-900 w-16 text-right tracking-tight">
                    {Math.round(selectedCand.score)}%
                  </span>
                </div>
              </div>

              <div className="space-y-5 text-sm mb-8">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3"><User className="w-4 h-4 text-[#0A6ED1]" /></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Expérience</p>
                    <p className="text-gray-900 font-medium">{selectedCand.experience}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center mr-3"><Calendar className="w-4 h-4 text-purple-600" /></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Candidature déposée le</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedCand.appliedDate).toLocaleDateString('fr-FR', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                {selectedCand.aiSummary && (
                  <div className="pt-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                      <Star className="w-3 h-3 mr-1 text-yellow-500" />
                      Analyse IA
                    </label>
                    <p className="text-sm text-gray-700 bg-purple-50/50 p-4 rounded-xl border border-purple-100 leading-relaxed font-medium">
                      {selectedCand.aiSummary}
                    </p>
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="pt-6 border-t border-gray-100 space-y-3">
                {selectedCand.cvUrl && (
                  <button
                    onClick={() => handleViewCv(selectedCand.applicationId!)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center transition-all shadow-sm"
                  >
                    <FileText className="w-4 h-4 mr-2 text-gray-500" />
                    Consulter le CV (MinIO)
                  </button>
                )}
                {selectedCand.status !== 'Interview' && selectedCand.status !== 'Accepted' && selectedCand.status !== 'Rejected' && (
                  <button
                    onClick={() => handleScheduleInterview(selectedCand.applicationId!)}
                    className="w-full px-4 py-2.5 bg-[#0A6ED1] text-white font-bold rounded-xl hover:bg-[#0959b0] flex items-center justify-center transition-all shadow-md shadow-blue-500/20"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Planifier un entretien
                  </button>
                )}
                {selectedCand.status !== 'Accepted' && selectedCand.status !== 'Rejected' && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => handleAcceptCandidate(selectedCand.applicationId!)}
                      className="px-4 py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all flex items-center justify-center shadow-md shadow-green-500/20"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Accepter
                    </button>
                    <button
                      onClick={() => handleRejectCandidate(selectedCand.applicationId!)}
                      className="px-4 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center h-full min-h-[400px] border border-white/60">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-[#0A6ED1]/40" />
              </div>
              <p className="text-gray-500 font-medium text-center">Sélectionnez un candidat dans la liste pour examiner son profil détaillé et son score IA.</p>
            </div>
          )}
        </motion.div>
      </div>

      <JobPostingForm
        isOpen={isJobFormOpen}
        onClose={() => setIsJobFormOpen(false)}
        onSave={handleSaveJob}
      />
    </div>
  );
}

// Simple fallback icon
const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
