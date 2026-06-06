import { Briefcase, Calendar, FileText, Clock } from 'lucide-react';

export default function CandidateSpace() {
  const applications = [
    {
      id: 1,
      position: 'Senior Software Engineer',
      company: 'WorkHub',
      appliedDate: '2026-04-10',
      status: 'Interview',
      nextStep: 'Entretien technique prévu le 25 Avril 2026',
      stage: 3,
      totalStages: 4,
    },
    {
      id: 2,
      position: 'Product Manager',
      company: 'WorkHub',
      appliedDate: '2026-04-05',
      status: 'Review',
      nextStep: 'En cours d\'examen par l\'équipe RH',
      stage: 2,
      totalStages: 4,
    },
    {
      id: 3,
      position: 'UX Designer',
      company: 'WorkHub',
      appliedDate: '2026-03-28',
      status: 'Rejected',
      nextStep: 'Candidature non retenue',
      stage: 1,
      totalStages: 4,
    },
  ];

  const upcomingInterviews = [
    {
      id: 1,
      position: 'Senior Software Engineer',
      type: 'Entretien Technique',
      date: '2026-04-25',
      time: '14:00',
      interviewer: 'Alex Martinez - Tech Lead',
      location: 'Visioconférence',
    },
  ];

  const tests = [
    {
      id: 1,
      name: 'Test Technique React/Node.js',
      position: 'Senior Software Engineer',
      deadline: '2026-04-22',
      duration: '2 heures',
      status: 'pending',
    },
  ];

  return (
    <div className="p-6 bg-[#F5F7FA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Mes Candidatures</h1>
        <p className="text-sm text-gray-600 mt-1">Suivez vos candidatures et vos entretiens</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Briefcase className="w-5 h-5 text-[#0A6ED1] mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Candidatures</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">3</p>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-orange-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">En cours</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">1</p>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-[#0A6ED1] mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Entretiens</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">1</p>
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 text-orange-600 mr-3" />
            <h3 className="text-xs font-medium text-gray-500 uppercase">Tests</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">1</p>
        </div>
      </div>

      {/* Mes Candidatures */}
      <div className="bg-white border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Mes Candidatures</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date de candidature</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progression</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prochaine étape</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{app.position}</p>
                    <p className="text-xs text-gray-600">{app.company}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(app.appliedDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Étape {app.stage}/{app.totalStages}</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1">
                        <div
                          className={`h-1 ${app.status === 'Rejected' ? 'bg-red-500' : 'bg-[#0A6ED1]'}`}
                          style={{ width: `${(app.stage / app.totalStages) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs ${
                      app.status === 'Interview' ? 'bg-blue-100 text-blue-800' :
                      app.status === 'Review' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{app.nextStep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entretiens Programmés */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Entretiens Programmés</h3>
          </div>
          <div className="p-6">
            {upcomingInterviews.map((interview) => (
              <div key={interview.id} className="border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">{interview.type}</h4>
                <p className="text-xs text-gray-600 mb-4">{interview.position}</p>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex">
                    <span className="text-gray-500 w-24">Date:</span>
                    <span className="text-gray-900">{new Date(interview.date).toLocaleDateString('fr-FR')} à {interview.time}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24">Avec:</span>
                    <span className="text-gray-900">{interview.interviewer}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24">Lieu:</span>
                    <span className="text-gray-900">{interview.location}</span>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-[#0A6ED1] text-white text-sm hover:bg-[#0959b0]">
                  Voir les détails
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tests à Compléter */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Tests à Compléter</h3>
          </div>
          <div className="p-6">
            {tests.map((test) => (
              <div key={test.id} className="border border-orange-300 bg-orange-50 p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">{test.name}</h4>
                <p className="text-xs text-gray-600 mb-4">{test.position}</p>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex">
                    <span className="text-gray-600 w-24">Deadline:</span>
                    <span className="text-gray-900">{new Date(test.deadline).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-24">Durée:</span>
                    <span className="text-gray-900">{test.duration}</span>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-orange-600 text-white text-sm hover:bg-orange-700">
                  Commencer le test
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
