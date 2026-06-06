import fs from 'fs';

const API_BASE = 'http://localhost:8085/api';

const orgId = '550e8400-e29b-41d4-a716-446655440000'; // Default org
const createdBy = '880e8400-e29b-41d4-a716-446655440000'; // Default user

const jobsData = [
  {
    title: 'Développeur Frontend Senior React',
    description: 'Recherche d\'un développeur frontend expert en React et TypeScript pour construire des interfaces complexes et très performantes.',
    location: 'dept-it',
    minExperience: 5,
    requiredSkills: '["React", "TypeScript", "Tailwind CSS", "Redux", "Framer Motion"]'
  },
  {
    title: 'Ingénieur DevOps',
    description: 'Nous cherchons un ingénieur DevOps pour gérer notre infrastructure cloud, pipelines CI/CD et assurer la haute disponibilité.',
    location: 'dept-it',
    minExperience: 3,
    requiredSkills: '["Docker", "Kubernetes", "AWS", "GitLab CI", "Terraform"]'
  },
  {
    title: 'Responsable Marketing Digital',
    description: 'Expert en stratégie digitale, SEO, SEA et gestion de campagnes publicitaires.',
    location: 'dept-marketing',
    minExperience: 4,
    requiredSkills: '["SEO", "Google Ads", "Analytics", "Social Media", "HubSpot"]'
  }
];

const candidatesData = [
  {
    candidateFullName: 'Amine Benali',
    cvUrl: 'https://example.com/cv/amine.pdf',
    status: 'NEW',
    extractedSkills: '["React", "JavaScript", "CSS", "Tailwind CSS", "Redux"]',
    extractedExperience: 4,
    aiScore: 85.5,
    aiSummary: 'Excellent profil technique. Maîtrise la majorité des compétences requises pour le poste Frontend. Très bonne correspondance.'
  },
  {
    candidateFullName: 'Sarah Idrissi',
    cvUrl: 'https://example.com/cv/sarah.pdf',
    status: 'PRESELECTED',
    extractedSkills: '["Java", "Spring Boot", "Docker", "AWS"]',
    extractedExperience: 3,
    aiScore: 65.0,
    aiSummary: 'Profil orienté Backend, manque d\'expérience sur Kubernetes et Terraform. Pourrait convenir avec une formation.'
  },
  {
    candidateFullName: 'Youssef Tazi',
    cvUrl: 'https://example.com/cv/youssef.pdf',
    status: 'NEW',
    extractedSkills: '["Marketing", "SEO", "Google Analytics", "Content Writing", "Facebook Ads"]',
    extractedExperience: 5,
    aiScore: 92.0,
    aiSummary: 'Correspondance parfaite pour le rôle Marketing Digital. Expérience solide et compétences parfaitement alignées.'
  },
  {
    candidateFullName: 'Kenza Alaoui',
    cvUrl: 'https://example.com/cv/kenza.pdf',
    status: 'REJECTED',
    extractedSkills: '["Photoshop", "Illustrator", "Design Graphique"]',
    extractedExperience: 1,
    aiScore: 15.0,
    aiSummary: 'Le profil est orienté Design Graphique et ne correspond pas du tout aux exigences techniques de ce poste.'
  }
];

async function seedData() {
  console.log('🌱 Début du remplissage des données de test pour l\'IA Match...');

  try {
    // 1. Créer les offres d'emploi
    const createdJobs = [];
    for (const job of jobsData) {
      console.log(`Création de l'offre: ${job.title}...`);
      const res = await fetch(`${API_BASE}/job-offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: orgId,
          createdBy: createdBy,
          title: job.title,
          description: job.description,
          location: job.location,
          minExperience: job.minExperience,
          contractType: 'CDI',
          status: 'PUBLISHED',
          requiredSkills: job.requiredSkills,
        })
      });
      if (res.ok) {
        const data = await res.json();
        createdJobs.push(data);
        console.log(`✅ Offre créée (ID: ${data.id})`);
      } else {
        console.error(`❌ Erreur création offre: ${res.status}`);
      }
    }

    if (createdJobs.length === 0) {
      console.error('Impossible de créer les offres, arrêt du script.');
      return;
    }

    // 2. Assigner les candidats aux offres créées
    const assignments = [
      { jobIndex: 0, candidateIndex: 0 }, // Amine -> Frontend
      { jobIndex: 1, candidateIndex: 1 }, // Sarah -> DevOps
      { jobIndex: 2, candidateIndex: 2 }, // Youssef -> Marketing
      { jobIndex: 0, candidateIndex: 3 }, // Kenza -> Frontend
    ];

    for (const assignment of assignments) {
      const job = createdJobs[assignment.jobIndex];
      const cand = candidatesData[assignment.candidateIndex];

      console.log(`Ajout du candidat ${cand.candidateFullName} à l'offre ${job.title}...`);
      
      const payload = {
        jobOfferId: job.id,
        candidateId: `cand-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Simulate ID
        candidateFullName: cand.candidateFullName,
        cvUrl: cand.cvUrl,
        status: cand.status,
        extractedSkills: cand.extractedSkills,
        extractedExperience: cand.extractedExperience,
        aiScore: cand.aiScore,
        aiSummary: cand.aiSummary
      };

      // Since applications are usually created through a different endpoint, 
      // adjust this according to your actual Spring Boot controller for applications
      const res = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        console.log(`✅ Candidat ${cand.candidateFullName} ajouté.`);
      } else {
        console.error(`❌ Erreur ajout candidat: ${res.status}`);
      }
    }

    console.log('🎉 Terminé ! Les données de test ont été injectées avec succès.');

  } catch (err) {
    console.error('Erreur inattendue:', err);
  }
}

seedData();
