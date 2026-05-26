# 📊 Fonctionnalités Paie Incomplètes - WorkHub
## Vue d'ensemble des fonctionnalités existantes au Frontend vs Backend

**Date d'analyse**: 26 Mai 2026  
**Statut Global**: ⚠️ Frontend avancé | Backend partiellement implémenté  

---

## 🎯 Résumé Exécutif

Le frontend dispose d'une **interface complète et riche** pour gérer la paie avec plusieurs sections, mais **beaucoup de fonctionnalités n'ont pas leur implémentation backend détaillée**. Le backend expose les endpoints basiques (génération, listage), mais les features avancées manquent.

**Distribution estimée:**
- ✅ **50%** Frontend + Backend opérationnels
- ⚠️ **40%** Frontend complet | Backend partiel
- ❌ **10%** Frontend + Backend incomplets

---

## 📋 SECTION 1: Rôle RH Manager - Gestion de la Paie

### Route Frontend: `/rh-manager/payroll`
**Composant**: `PayrollEnhanced.tsx` (292 lignes)

#### 1.1 Affichage de l'Historique Mensuel ✅⚠️
**Statut**: Frontend complet | Backend partiellement implémenté

**Frontend - Fonctionnalités existantes:**
```
✅ Tableau d'historique avec colonnes:
  - Période (Mois/Année)
  - Nombre d'employés
  - Montant Brut (MAD)
  - Montant Net (MAD)
  - Statut (Traité, Payé, Brouillon)
  - Actions (Télécharger, Modifier, Marquer comme Payé)

✅ Filtrage par période
✅ Export CSV de l'historique
✅ Sélection individuelle de paies
✅ Affichage du détail de la paie (breakdown)
  - Composants: Salaire de Base, Heures Supp, Primes, Indemnités
  - Déductions: Assurance Maladie, Impôts, Caisse Retraite
  - Totaux: Montant Brut, Retenues, Montant Net
```

**Backend - Situation actuelle:**
```
✅ GET /api/payrolls - Liste les paies par organisation
  - Paramètre: organizationId (UUID)
  - Retourne: List<Payroll> trié par année/mois descendant

✅ Données stockées en DB:
  - id (UUID)
  - organizationId
  - month, year
  - status (DRAFT, PROCESSED, PAID)
  - totalGrossSalary, totalNetSalary
  - totalCnss, totalAmo, totalIr
  - generatedAt, generatedBy
  - validatedAt

⚠️ MANQUE: Endpoint pour obtenir le détail complet d'une paie (breakdown par composant)
⚠️ MANQUE: Pagination et filtres avancés
⚠️ MANQUE: Endpoint pour modifier le statut (marquer comme payé)
```

---

### Route Frontend: `/rh-manager/payroll-generation`
**Composant**: `PayrollGeneration.tsx` (498 lignes)

#### 1.2 Génération de la Paie Mensuelle ✅⚠️
**Statut**: Frontend complet | Backend implémenté

**Frontend - Fonctionnalités existantes:**
```
✅ Sélection du mois/année via input date
✅ Tableau éditable avec 18 employés (mock data):
  - Matricule, Nom, Prénom, Département, Poste
  - Salaire Brut, Ancienneté, Transport
  - Prime Perf (champ éditable)
  - Absences
  - Heures Supp (champ éditable)
  - Net à Payer calculé automatiquement

✅ Calcul automatique:
  - Brut = Salaire Base + Ancienneté + Transport + Prime Perf + (H.Supp × 150)
  - CNSS (4.48%), AMO (2.26%), IR (10%)
  - Déduction absences = (Salaire / 26) × Nb absences
  - Net = Brut - (CNSS + AMO + IR + Absences)

✅ Filtrage et recherche:
  - Recherche par nom/prénom/matricule
  - Filtre par département (Tous, IT, Ventes, Marketing, RH, Finance)

✅ Sélection multiple des employés:
  - Checkbox pour chaque ligne
  - Bouton "Sélectionner tout"
  - Actions groupées: Appliquer prime, Ajouter heures supp

✅ Édition en ligne:
  - Clic sur ligne → éditer Prime Perf et Heures Supp
  - Bouton checkmark pour valider

✅ Résumé financier (4 cartes KPI):
  - Salaire Brut Total
  - Salaire Net Total
  - Charges Sociales
  - Coût Total Employeur (Brut × 1.20)

✅ Boutons d'actions:
  - Exporter Données (CSV)
  - Enregistrer Brouillon (sauvegarde en localStorage)
  - Générer la Paie (appel backend)

✅ Instructions et informations:
  - Vérifier primes et heures avant génération
  - Absences déduites automatiquement
  - Bulletins disponibles après génération
  - Notification email aux employés
```

**Backend - Situation actuelle:**
```
✅ POST /api/payrolls/generate?orgId=&month=&year=&generatedBy=
  - Récupère les employés actifs via EmployeeClient
  - Calcule les salaires avec PayrollEngine
  - Génère PDF et l'envoie à MinIO
  - Persiste les données en DB
  - Publie événement Kafka (PayrollGeneratedEvent)
  - Retourne objet Payroll complet

✅ PayrollEngine - Logique de calcul:
  - Récupère paramètres CNSS/AMO (configurable par organisation)
  - Calcule le brut avec tous les éléments
  - Applique les retenues
  - Gère les brackets d'impôt (IR)

✅ Génération PDF des bulletins:
  - Utilise iText7
  - Stockage dans MinIO
  - Noms de fichiers: bulletin_Mois_Année_EmployeeId.pdf

✅ Intégration Kafka:
  - Événement: PayrollGeneratedEvent
  - Utilisé par notification-service pour envoyer emails

⚠️ MANQUE: Fetch des données d'employés depuis la vraie API (actuellement hardcodé en frontend)
⚠️ MANQUE: Modification des composants de paie après génération
⚠️ MANQUE: Validation des données avant génération (ex: employés supprimés)
⚠️ MANQUE: Gestion des congés et absences justifiées
```

---

### Route Frontend: `/rh-manager/payroll-bulletins`
**Composant**: `PayslipsManagement.tsx` (439 lignes)

#### 1.3 Gestion des Bulletins de Paie ✅⚠️
**Statut**: Frontend complet | Backend incomplet

**Frontend - Fonctionnalités existantes:**
```
✅ Statistiques (4 KPI):
  - Bulletins Générés: 18
  - Envoyés: 16 (89%)
  - Consultés: 12 (67% des envoyés)
  - Montant Net Total: MAD X,XXX

✅ Filtrage avancé:
  - Recherche par nom/matricule
  - Filtre par mois
  - Filtre par statut (Tous, Envoyé, En attente)

✅ Sélection multiple:
  - Checkbox par bulletin
  - "Sélectionner tout"
  - Actions groupées: Envoyer par email, Télécharger ZIP

✅ Liste des bulletins (colonne gauche):
  - Affichage en colonnes:
    * Nom de l'employé
    * Matricule + Poste
    * Montant Net
    * Statut (Envoyé / En attente)
    * Indicateur: Consulté (avec icône Eye)
  - Sélection visuelle (couleur bleue)
  - États visuels: checkmark vert / horloge orange

✅ Prévisualisation PDF (colonne droite):
  - Mock-up complet du bulletin avec:
    * En-tête: Logo + Infos entreprise (WorkHub / TechVision SARL)
    * Section "Bulletin de Paie - Avril 2026"
    * Données employé: Nom, Matricule, Poste, CNSS
    * Table de rémunération: Salaire Base, Ancienneté, Transport → Brut
    * Table des retenues: CNSS, AMO, IR
    * Net à Payer (fond bleu, police large)
    * Footer: "Document généré automatiquement par WorkHub"

✅ Boutons d'action par bulletin:
  - Prévisualiser
  - Télécharger (PDF)
  - Envoyer (email)

✅ Statut d'envoi:
  - ✅ Si "Envoyé": affiche date/heure d'envoi et email de destination
  - ⏳ Si "En attente": indication visuelle en orange

✅ Indicateur consulté:
  - Eye icon + "Consulté" si l'employé a consultté
```

**Backend - Situation actuelle:**
```
❌ AUCUN endpoint pour:
  - Récupérer les bulletins d'une paie
  - Envoyer un bulletin via email
  - Marquer un bulletin comme consulté
  - Télécharger un bulletin (PDF)
  - Obtenir le statut d'envoi d'un bulletin

⚠️ Partiellement implémenté:
  - Génération PDF côté service (PayrollService crée les PDFs)
  - Stockage MinIO existant (mais pas d'endpoint pour y accéder)
  - Événement Kafka envoyé (notification-service responsable de l'email)

❌ Tables manquantes:
  - payslip_distribution (statut d'envoi, date envoi, email)
  - payslip_read_indicator (tracking des consultations)

❌ Entities manquantes:
  - Payslip entity
  - PayslipDistribution entity
```

---

### Route Frontend: `/rh-manager/payroll-history`
**Composant**: `PayrollHistory.tsx` (322 lignes)

#### 1.4 Historique et Statistiques Détaillées ✅⚠️
**Statut**: Frontend complet | Backend incomplet

**Frontend - Fonctionnalités existantes:**
```
✅ Sélecteur d'année: 2024, 2025, 2026

✅ Résumé YTD (4 KPI):
  - Masse Salariale Brute YTD: MAD 1,231,000
  - Salaire Net Total YTD: MAD 944,000 (76.7% du brut)
  - Charges Sociales YTD: MAD 287,000 (23.3% du brut)
  - Coût Moyen par Employé: MAD 4,622/mois

✅ Graphiques:
  1️⃣ Évolution Mensuelle (LineChart 6 mois)
     - Ligne 1: Salaire Brut
     - Ligne 2: Salaire Net
     - Ligne 3: Charges Sociales
     Données: Jan-Juin 2026

  2️⃣ Coûts Salariaux par Département (BarChart)
     - Départements: IT, Ventes, Marketing, RH, Finance
     - Valeurs: Coût par département

  3️⃣ Répartition des Charges Sociales (PieChart)
     - CNSS: 9,318 MAD
     - AMO: 4,701 MAD
     - IR: 20,800 MAD
     - Autres: 4,000 MAD
     - Avec affichage % et legende

  4️⃣ Coût Moyen par Département (Barres horizontales + texte)
     - Affiche MAD/employé par département
     - Exemple: IT 5,667 MAD/emp

✅ Comparaisons Trimestrielles:
  - Q1 2026: Masse 601,000 | Var +3.2% | Effectif 44
  - Q2 2026: Masse 628,000 | Var +4.5% | Effectif 45
  - Cumul 2026: Masse 1,229,000 | Var +3.8% | Effectif 45

✅ Tableau Historique Détaillé (2026):
  Colonnes:
  - Mois (Jan 2026 - Juin 2026)
  - Salaire Brut
  - CNSS (calculé: 4.48% du brut)
  - AMO (calculé: 2.26% du brut)
  - IR (calculé: 10% du brut)
  - Salaire Net
  - Variation (% vs mois précédent)
  
  Footer avec totaux YTD

✅ Boutons:
  - Export Rapport (année sélectionnée)
```

**Backend - Situation actuelle:**
```
⚠️ Partiellement disponible:
  - GET /api/payrolls?organizationId= retourne la liste
  - Mais PAS de filtrage par année

❌ MANQUE d'endpoints analytiques:
  - /api/payrolls/analytics/ytd?orgId=&year= (KPI globaux)
  - /api/payrolls/analytics/by-department?orgId=&month=&year=
  - /api/payrolls/analytics/charges-distribution?orgId=&month=&year=
  - /api/payrolls/analytics/trend?orgId=&year= (évolution mensuelle)
  - /api/payrolls/analytics/comparison?orgId=&period= (comparaisons)

❌ MANQUE agrégation en base de données:
  - Vue matérialisée pour évolution mensuelle
  - Calculated fields dans l'entity Payroll
  - Queries JPA complexes

❌ MANQUE service d'analytique:
  - PayrollAnalyticsService
  - Calculs statistiques
  - Exports en format (PDF, Excel)
```

---

## 📋 SECTION 2: Rôle Administrateur Org - Analytics Paie

### Route Frontend: `/org-admin/payroll`
**Composant**: `PayrollAnalytics.tsx` (196 lignes)

#### 2.1 Vue Analytique de la Paie ✅❌
**Statut**: Frontend complet | Backend inexistant

**Frontend - Fonctionnalités existantes:**
```
✅ Accès restreint:
  - "Mode Analyse Uniquement" - Admin Org ne peut PAS générer
  - Message: "La génération de la paie est effectuée par l'équipe RH"

✅ KPI (4 cartes):
  - Masse Salariale Avril: MAD 198,000 (↑ +7%)
  - Coût Moyen/Employé: MAD 4,400 (↑ +2%)
  - Charges Sociales: MAD 39,600 (↑ +7%)
  - Budget Annuel Utilisé: 32%

✅ Graphiques:
  1️⃣ Évolution de la Masse Salariale (LineChart)
     - Jan à Avr 2026
     - Ligne 1: Masse Salariale
     - Ligne 2: Charges Sociales

  2️⃣ Coûts par Département - Avril (BarChart)
     - IT: 82,500 MAD
     - Ventes: 52,800 MAD
     - Marketing: 35,200 MAD
     - Finance: 19,800 MAD
     - RH: 7,700 MAD

✅ Comparaisons Mensuelles:
  - Mars vs Avril: +7.0% (+MAD 13,000)
  - Février vs Avril: +12.5% (+MAD 22,000)
  - Janvier vs Avril: +17.9% (+MAD 30,000)

✅ Budget Payroll (détails):
  - Budget Total Annuel: MAD 2,400,000
  - Dépensé (Jan-Avr): MAD 762,000
  - Restant: MAD 1,638,000 (vert)
  - Utilisation: 32% (progress bar)
  - Projection Fin d'Année: MAD 2,376,000
```

**Backend - Situation actuelle:**
```
❌ AUCUN endpoint pour analytics:
  - Pas de /api/payrolls/analytics/*
  - Pas de /api/organizations/{id}/payroll-analytics

❌ MANQUE:
  - Service d'analytique payroll
  - DTOs spécifiques pour analytics
  - Calculs d'agrégations
  - Queries optimisées
  - Caching des analytics
  - Export de rapports

❌ Configuration budget manquante:
  - Table: organization_payroll_budget
  - Fields: annual_budget, utilisé, restant
  - pas d'entity PayrollBudget
```

---

### Route Frontend: `/org-admin/payroll-settings`
**Composant**: `PayrollSettings.tsx` (à explorer)

#### 2.2 Configuration de la Paie ❌❌
**Statut**: Frontend + Backend incomplets (non explorés en détail)

**Supposée (à vérifier):**
```
❌ Configuration des paramètres de paie:
  - Taux CNSS, AMO, IR
  - Règles de calcul
  - Assiettes de rémunération
  - Éléments variables (primes, indemnités)

❌ Gestion des devises

❌ Calendrier de paie

❌ Processus d'approbation
```

---

## 📋 SECTION 3: Rôle Employé - Consultation des Bulletins

### Route Frontend: `/employee/bulletins`
**Composant**: `MesBulletins.tsx` (à explorer)

#### 3.1 Consultation des Bulletins Personnels ⚠️⚠️
**Statut**: Frontend partiellement implémenté | Backend inexistant

**Supposée (à vérifier):**
```
✅ Consultation de ses propres bulletins
⚠️ Téléchargement PDF
❌ Historique détaillé (versants, déductions perso)
❌ Notification de réception
❌ Tracking de lecture
```

---

## 📋 SECTION 4 : Dashboard Principal

### 4.1 Dashboard Org Admin - Masse Salariale ⚠️⚠️
**Composant**: `DashboardOrgAdmin.tsx` (ligne ~4)

**KPI visible:**
```
✅ Masse Salariale: MAD 198,450 (↑ +2.5%)
  Affichage sur la page d'accueil Admin Org

⚠️ Données actuelles: statiques/mockées
❌ MANQUE: Appel API pour données réelles
```

---

## 🔴 RÉSUMÉ DES LACUNES - Priorisation

### 🔴 HAUTE PRIORITÉ (Bloquants)

| # | Fonctionnalité | Frontend | Backend | Impact | Effort |
|---|---|---|---|---|---|
| 1 | Endpoint détail paie (breakdown) | ✅ | ❌ | Blocage affichage composants | MOYEN |
| 2 | Endpoints bulletins/statut envoi | ✅ | ❌ | Blocage gestion bulletins | HAUT |
| 3 | Modification post-génération | ✅ | ❌ | Flexibilité RH | HAUT |
| 4 | API employés real-time | ❌ | ❌ | Données obsolètes | MOYEN |
| 5 | Fetch données analytiques | ✅ | ❌ | Dashboard vide | MOYEN |

### 🟠 PRIORITÉ MOYENNE

| # | Fonctionnalité | Frontend | Backend | Impact | Effort |
|---|---|---|---|---|---|
| 6 | Configuration paramétrages | ⚠️ | ❌ | Flexibilité calculs | MOYEN |
| 7 | Gestion congés-absences | ⚠️ | ❌ | Exactitude calculs | MOYEN |
| 8 | Marquer paie comme payée | ✅ | ❌ | Workflow incomplet | FAIBLE |
| 9 | Export rapports (PDF/Excel) | ⚠️ | ❌ | Documentaire | MOYEN |
| 10 | Approbation paies | ❌ | ❌ | Gouvernance | HAUT |

### 🟡 PRIORITÉ FAIBLE

| # | Fonctionnalité | Frontend | Backend | Impact | Effort |
|---|---|---|---|---|---|
| 11 | Dashboard employé real-time | ⚠️ | ❌ | UX employee | FAIBLE |
| 12 | Notifications emails auto | ✅ | ⚠️ | UX | FAIBLE |
| 13 | Tracking consultation bulletins | ✅ | ❌ | Analytics | FAIBLE |

---

## 🛠️ RECOMMANDATIONS TECHNIQUES

### Phase 1: Core Endpoints (2-3 jours)
```java
// À créer dans PayrollController + PayrollService

// 1. GET /api/payrolls/{id} - Détail complèt
@GetMapping("/{id}")
public PayrollDetailDTO getPayrollDetail(@PathVariable UUID id)

// 2. GET /api/payrolls/{id}/items - Items de paie
@GetMapping("/{id}/items")
public List<PayrollItemDTO> getPayrollItems(@PathVariable UUID id)

// 3. PUT /api/payrolls/{id}/status - Changer statut
@PutMapping("/{id}/status")
public Payroll updateStatus(@PathVariable UUID id, @RequestParam PayrollStatus status)

// 4. GET /api/payrolls?year=&month= - Filtrage avancé
@GetMapping
public List<Payroll> getPayrolls(
  @RequestParam UUID organizationId, 
  @RequestParam(required=false) Integer year,
  @RequestParam(required=false) Integer month,
  @RequestParam(defaultValue="0") int page,
  @RequestParam(defaultValue="20") int size
)
```

### Phase 2: Analytics Endpoints (3-4 jours)
```java
// À créer: PayrollAnalyticsController + PayrollAnalyticsService

@GetMapping("/analytics/ytd")
public PayrollAnalyticsDTO getYTDAnalytics(@RequestParam UUID orgId, @RequestParam int year)

@GetMapping("/analytics/by-department")
public List<DepartmentPayrollDTO> getByDepartment(@RequestParam UUID orgId, @RequestParam int month, @RequestParam int year)

@GetMapping("/analytics/charges")
public ChargesDistributionDTO getChargesDistribution(@RequestParam UUID orgId, @RequestParam int month, @RequestParam int year)

@GetMapping("/analytics/trend")
public List<MonthlyTrendDTO> getTrend(@RequestParam UUID orgId, @RequestParam int year)
```

### Phase 3: Payslip Management (3-4 jours)
```java
// À créer: PayslipController + PayslipService
// À créer: Payslip entity + PayslipDistribution entity

@PostMapping("/{payrollId}/payslips/send-email")
public void sendPayslipsEmail(@PathVariable UUID payrollId, @RequestBody List<UUID> employeeIds)

@PutMapping("/payslips/{id}/mark-read")
public void markPayslipAsRead(@PathVariable UUID id)

@GetMapping("/payslips/{id}/download")
public ResponseEntity<byte[]> downloadPayslip(@PathVariable UUID id)
```

### Phase 4: Configuration & Avancé (2-3 jours)
```java
// Configuration des paramètres
@RestController
@RequestMapping("/api/payroll-config")
public class PayrollConfigController { }

// Gestion des budgets
@RestController
@RequestMapping("/api/payroll-budget")
public class PayrollBudgetController { }
```

---

## 📊 Données de Calcul Actuelles (Hardcodées)

**Paramètres de calcul utilisés:**
```
Taux CNSS: 4.48%
Taux AMO: 2.26%
Taux IR: 10% (plat, pas de progressif actuellement)

Formule de calcul Net:
Net = Brut - (CNSS + AMO + IR + Absences)

Où:
Brut = Salaire Base + Ancienneté + Transport + Prime Perf + (Heures Supp × 150/h)

Absence = (Salaire Base / 26 jours) × Nb Absences
```

**À noter:** Les taux semblent basés sur Maroc (CNSS/AMO marocains)

---

## 📝 Checklist d'Implémentation

- [ ] **Phase 1: Endpoints Core**
  - [ ] GET /api/payrolls/{id} - détail
  - [ ] GET /api/payrolls/{id}/items - items
  - [ ] PUT /api/payrolls/{id}/status - changement statut
  - [ ] GET /api/payrolls - avec filtres avancés

- [ ] **Phase 2: Analytics**
  - [ ] GET /api/payrolls/analytics/ytd
  - [ ] GET /api/payrolls/analytics/by-department
  - [ ] GET /api/payrolls/analytics/charges
  - [ ] GET /api/payrolls/analytics/trend

- [ ] **Phase 3: Bulletins**
  - [ ] Créer entities Payslip + PayslipDistribution
  - [ ] POST /api/payslips/send-email
  - [ ] PUT /api/payslips/{id}/mark-read
  - [ ] GET /api/payslips/{id}/download

- [ ] **Phase 4: Configuration**
  - [ ] PayrollConfig management
  - [ ] PayrollBudget management
  - [ ] Paramètres par organisation

---

## 🔗 Fichiers à Modifier/Créer

### Frontend (à vérifier si compatible avec données réelles)
```
✅ src/app/components/spaces/rh-manager/PayrollGeneration.tsx
✅ src/app/components/spaces/rh-manager/PayslipsManagement.tsx
✅ src/app/components/spaces/rh-manager/PayrollHistory.tsx
✅ src/app/components/spaces/org-admin/PayrollAnalytics.tsx
⚠️ src/app/components/spaces/org-admin/PayrollSettings.tsx
⚠️ src/app/components/spaces/employee/MesBulletins.tsx
```

### Backend (à créer/modifier)
```
❌ services/payroll-service/src/main/java/com/workhub/payroll/api/PayrollAnalyticsController.java (NEW)
❌ services/payroll-service/src/main/java/com/workhub/payroll/api/PayslipController.java (NEW)
❌ services/payroll-service/src/main/java/com/workhub/payroll/service/PayrollAnalyticsService.java (NEW)
❌ services/payroll-service/src/main/java/com/workhub/payroll/service/PayslipService.java (NEW)
❌ services/payroll-service/src/main/java/com/workhub/payroll/domain/Payslip.java (NEW)
❌ services/payroll-service/src/main/java/com/workhub/payroll/domain/PayslipDistribution.java (NEW)
⚠️ services/payroll-service/src/main/java/com/workhub/payroll/api/PayrollController.java (MODIFY)
⚠️ services/payroll-service/src/main/java/com/workhub/payroll/service/PayrollService.java (MODIFY)

🗂️ SQL Migrations (Flyway):
❌ V1.3__create_payslip_tables.sql
❌ V1.4__create_payroll_config_tables.sql
```

---

## 🎓 Notes Supplémentaires

1. **Données Mockées Frontend**: Les données affichées au frontend (18 employés, paies statiques) ne sont **PAS** connectées à l'API réelle. Il faut créer des endpoints pour récupérer les vrais employés.

2. **Stockage Bulletins**: Les PDFs sont générés et stockés dans **MinIO**, mais il n'existe pas d'endpoint pour **télécharger** les bulletins existants.

3. **Événements Kafka**: L'événement `PayrollGeneratedEvent` est publié, mais le `notification-service` doit être vérifié pour s'assurer qu'il envoie réellement les emails.

4. **Authentification Clerk**: Le token Clerk est utilisé au frontend (voir `PayrollGeneration.tsx` ligne 154), mais le backend marche en mode "open" pour les tests (CORS Config, pas de vérification token).

5. **Infrastructure Supportée**: 
   - ✅ PostgreSQL (migrations Flyway présentes)
   - ✅ MinIO (stockage PDFs)
   - ✅ Kafka (événements)
   - ✅ Email (via notification-service + Mailhog)

---

## 💡 Conclusion

Le **frontend WorkHub est très avancé** pour la gestion de paie, avec une interface complète et professionnelle. Cependant, le **backend n'implémente que 50% des besoins**. Les endpoints essentiels (génération, listage) existent et fonctionnent, mais les APIs secondaires (analytics, bulletins, configuration) manquent entièrement.

**Effort estimé pour compléter**: **2-3 semaines** de développement backend (1 dev full-time).


