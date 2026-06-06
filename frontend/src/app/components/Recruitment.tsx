import { useState } from 'react';
import { Plus, Search, TrendingUp, User, FileText, Calendar, Star } from 'lucide-react';

export default function Recruitment() {
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);

  const jobs = [
    { id: 1, title: 'Senior Software Engineer', department: 'Engineering', openings: 3, applicants: 47, status: 'Active' },
    { id: 2, title: 'Product Manager', department: 'Product', openings: 1, applicants: 32, status: 'Active' },
    { id: 3, title: 'UX Designer', department: 'Design', openings: 2, applicants: 28, status: 'Active' },
    { id: 4, title: 'Marketing Manager', department: 'Marketing', openings: 1, applicants: 19, status: 'Active' },
  ];

  const candidates = [
    { id: 1, name: 'James Wilson', position: 'Senior Software Engineer', score: 95, status: 'Interview', appliedDate: '2026-04-10', experience: '8 years', location: 'San Francisco', skills: ['React', 'Node.js', 'Python'] },
    { id: 2, name: 'Maria Garcia', position: 'Senior Software Engineer', score: 92, status: 'Review', appliedDate: '2026-04-12', experience: '7 years', location: 'Austin', skills: ['Java', 'Spring', 'AWS'] },
    { id: 3, name: 'Robert Lee', position: 'Product Manager', score: 88, status: 'Interview', appliedDate: '2026-04-08', experience: '6 years', location: 'New York', skills: ['Strategy', 'Agile', 'Analytics'] },
    { id: 4, name: 'Amanda Taylor', position: 'UX Designer', score: 90, status: 'Review', appliedDate: '2026-04-15', experience: '5 years', location: 'Seattle', skills: ['Figma', 'Research', 'Prototyping'] },
    { id: 5, name: 'Daniel Brown', position: 'Marketing Manager', score: 85, status: 'New', appliedDate: '2026-04-18', experience: '9 years', location: 'Chicago', skills: ['Digital Marketing', 'SEO', 'Analytics'] },
  ];

  const selectedCand = candidates.find(c => c.id === selectedCandidate);

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Recruitment</h1>
          <p className="text-sm text-gray-600 mt-1">AI-powered recruitment and candidate management</p>
        </div>
        <button className="px-4 py-2 bg-[#0A6ED1] text-white rounded hover:bg-[#0959b0] flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Post New Job
        </button>
      </div>

      {/* Job Openings */}
      <div className="bg-white rounded border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Active Job Openings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {jobs.map((job) => (
            <div key={job.id} className="border border-gray-200 rounded p-4 hover:border-[#0A6ED1] transition-colors">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">{job.title}</h4>
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
        {/* Candidates List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Candidates</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search candidates..."
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
                  {candidates.map((candidate) => (
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
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {candidate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                            Accept
                          </button>
                          <button className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Candidate Detail */}
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
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Schedule Interview
                </button>
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
    </div>
  );
}
