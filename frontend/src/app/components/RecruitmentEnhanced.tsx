import { useState, useEffect } from 'react';
import { Plus, Search, TrendingUp, User, FileText, Calendar, Star, Download, Trash2 } from 'lucide-react';
import JobPostingForm from './JobPostingForm';
import NotificationToast from './NotificationToast';
import { saveToLocalStorage, loadFromLocalStorage, exportToCSV } from '../utils/dataManager';

interface JobPosting {
  id: number;
  title: string;
  department: string;
  openings: number;
  applicants: number;
  status: string;
  description?: string;
  requirements?: string;
}

interface Candidate {
  id: number;
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
}

const initialJobs: JobPosting[] = [
  { id: 1, title: 'Senior Software Engineer', department: 'Engineering', openings: 3, applicants: 47, status: 'Active' },
  { id: 2, title: 'Product Manager', department: 'Product', openings: 1, applicants: 32, status: 'Active' },
  { id: 3, title: 'UX Designer', department: 'Design', openings: 2, applicants: 28, status: 'Active' },
  { id: 4, title: 'Marketing Manager', department: 'Marketing', openings: 1, applicants: 19, status: 'Active' },
];

const initialCandidates: Candidate[] = [
  { id: 1, name: 'James Wilson', position: 'Senior Software Engineer', score: 95, status: 'Interview', appliedDate: '2026-04-10', experience: '8 years', location: 'San Francisco', skills: ['React', 'Node.js', 'Python'], email: 'james.w@email.com', phone: '+1 234-567-8910' },
  { id: 2, name: 'Maria Garcia', position: 'Senior Software Engineer', score: 92, status: 'Review', appliedDate: '2026-04-12', experience: '7 years', location: 'Austin', skills: ['Java', 'Spring', 'AWS'], email: 'maria.g@email.com', phone: '+1 234-567-8911' },
  { id: 3, name: 'Robert Lee', position: 'Product Manager', score: 88, status: 'Interview', appliedDate: '2026-04-08', experience: '6 years', location: 'New York', skills: ['Strategy', 'Agile', 'Analytics'], email: 'robert.l@email.com', phone: '+1 234-567-8912' },
  { id: 4, name: 'Amanda Taylor', position: 'UX Designer', score: 90, status: 'Review', appliedDate: '2026-04-15', experience: '5 years', location: 'Seattle', skills: ['Figma', 'Research', 'Prototyping'], email: 'amanda.t@email.com', phone: '+1 234-567-8913' },
  { id: 5, name: 'Daniel Brown', position: 'Marketing Manager', score: 85, status: 'New', appliedDate: '2026-04-18', experience: '9 years', location: 'Chicago', skills: ['Digital Marketing', 'SEO', 'Analytics'], email: 'daniel.b@email.com', phone: '+1 234-567-8914' },
];

export default function RecruitmentEnhanced() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

  useEffect(() => {
    const savedJobs = loadFromLocalStorage('workhub_jobs', initialJobs);
    const savedCandidates = loadFromLocalStorage('workhub_candidates', initialCandidates);
    setJobs(savedJobs);
    setCandidates(savedCandidates);
  }, []);

  useEffect(() => {
    if (jobs.length > 0) {
      saveToLocalStorage('workhub_jobs', jobs);
    }
  }, [jobs]);

  useEffect(() => {
    if (candidates.length > 0) {
      saveToLocalStorage('workhub_candidates', candidates);
    }
  }, [candidates]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, visible: true });
  };

  const handleSaveJob = (jobData: Partial<JobPosting>) => {
    const newJob = {
      ...jobData,
      id: Math.max(...jobs.map(j => j.id), 0) + 1,
    } as JobPosting;
    setJobs(prev => [...prev, newJob]);
    showNotification('Job posted successfully', 'success');
  };

  const handleDeleteJob = (id: number) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      setJobs(prev => prev.filter(job => job.id !== id));
      showNotification('Job posting deleted', 'success');
    }
  };

  const handleAcceptCandidate = (id: number) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: 'Accepted' } : c));
    showNotification('Candidate accepted', 'success');
  };

  const handleRejectCandidate = (id: number) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: 'Rejected' } : c));
    showNotification('Candidate rejected', 'info');
  };

  const handleScheduleInterview = (id: number) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: 'Interview' } : c));
    showNotification('Interview scheduled', 'success');
  };

  const handleExportJobs = () => {
    exportToCSV(jobs, 'job_postings');
    showNotification('Job postings exported', 'success');
  };

  const handleExportCandidates = () => {
    exportToCSV(candidates, 'candidates');
    showNotification('Candidates exported', 'success');
  };

  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCand = candidates.find(c => c.id === selectedCandidate);

  return (
    <div className="p-6">
      <NotificationToast
        message={notification.message}
        type={notification.type}
        isVisible={notification.visible}
        onClose={() => setNotification({ ...notification, visible: false })}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Recruitment</h1>
          <p className="text-sm text-gray-600 mt-1">AI-powered recruitment and candidate management</p>
        </div>
        <div className="flex space-x-3">
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

      <div className="bg-white rounded border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Active Job Openings</h3>
          <button
            onClick={handleExportJobs}
            className="text-sm text-[#0A6ED1] hover:underline flex items-center"
          >
            <Download className="w-4 h-4 mr-1" />
            Export Jobs
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {jobs.map((job) => (
            <div key={job.id} className="border border-gray-200 rounded p-4 hover:border-[#0A6ED1] transition-colors relative group">
              <button
                onClick={() => handleDeleteJob(job.id)}
                className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 pr-8">{job.title}</h4>
              <p className="text-xs text-gray-600 mb-3">{job.department}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{job.openings} openings</span>
                <span className="text-[#0A6ED1] font-medium">{job.applicants} applicants</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Candidates</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0A6ED1] focus:border-transparent"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCandidates.map((candidate) => (
                    <tr
                      key={candidate.id}
                      className={`hover:bg-gray-50 cursor-pointer ${selectedCandidate === candidate.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedCandidate(candidate.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-[#0A6ED1] flex items-center justify-center text-white text-sm mr-3">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                            <p className="text-xs text-gray-500">{candidate.experience}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{candidate.position}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                          <span className="text-sm font-medium text-gray-900">{candidate.score}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs rounded ${
                          candidate.status === 'Interview' ? 'bg-blue-100 text-blue-800' :
                          candidate.status === 'Review' ? 'bg-orange-100 text-orange-800' :
                          candidate.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                          candidate.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {candidate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {candidate.status !== 'Accepted' && candidate.status !== 'Rejected' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcceptCandidate(candidate.id);
                                }}
                                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Accept
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectCandidate(candidate.id);
                                }}
                                className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
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
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {selectedCand ? (
            <div className="bg-white rounded border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Candidate Profile</h3>

              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-[#0A6ED1] flex items-center justify-center text-white text-2xl mb-3">
                  {selectedCand.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h4 className="text-lg font-semibold text-gray-900">{selectedCand.name}</h4>
                <p className="text-sm text-gray-600">{selectedCand.position}</p>
              </div>

              <div className="mb-6">
                <label className="text-xs text-gray-500 uppercase mb-2 flex items-center">
                  <Star className="w-3 h-3 mr-1 text-yellow-500" />
                  AI Match Score
                </label>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${selectedCand.score}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{selectedCand.score}%</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase">Status</label>
                  <p className="text-sm mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs rounded ${
                      selectedCand.status === 'Interview' ? 'bg-blue-100 text-blue-800' :
                      selectedCand.status === 'Review' ? 'bg-orange-100 text-orange-800' :
                      selectedCand.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                      selectedCand.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedCand.status}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase flex items-center mb-1">
                    <User className="w-3 h-3 mr-1" />
                    Experience
                  </label>
                  <p className="text-sm text-gray-900">{selectedCand.experience}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase flex items-center mb-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    Applied Date
                  </label>
                  <p className="text-sm text-gray-900">{new Date(selectedCand.appliedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase mb-2 block">Location</label>
                  <p className="text-sm text-gray-900">{selectedCand.location}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase mb-2 block">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCand.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <button className="w-full px-4 py-2 bg-[#0A6ED1] text-white rounded hover:bg-[#0959b0] flex items-center justify-center">
                  <FileText className="w-4 h-4 mr-2" />
                  View CV
                </button>
                {selectedCand.status !== 'Interview' && selectedCand.status !== 'Accepted' && selectedCand.status !== 'Rejected' && (
                  <button
                    onClick={() => handleScheduleInterview(selectedCand.id)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Schedule Interview
                  </button>
                )}
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                  Send Message
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded border border-gray-200 p-6 flex items-center justify-center h-64">
              <p className="text-sm text-gray-500">Select a candidate to view profile</p>
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
