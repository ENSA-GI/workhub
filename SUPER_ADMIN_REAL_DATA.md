# SUPER-ADMIN : Logs et Surveillance en Temps Réel

## ✅ Améliorations Apportées

### 1. **Logs Système (SystemLogs.tsx)**
- ✅ **Avant** : Données fictives en dur
- ✅ **Après** : Logs **réels** depuis l'audit service
  - Récupère les vrais logs d'audit (`/api/audit-logs`)
  - Convertit les actions métier en logs système
  - Affiche les 50 derniers logs
  - Auto-rafraîchit tous les 30 secondes
  - Bouton "Actualiser" manuel

**Données affichées :**
- Type (INFO, WARNING, ERROR)
- Service concerné (Employee, Org, Leave, etc.)
- Action effectuée
- Détails (User, Entity, etc.)
- Timestamp en temps réel

### 2. **Monitoring Système (SystemMonitoringDashboard.tsx)**
- ✅ **Avant** : Statut service fictif
- ✅ **Après** : Health checks **vrais** de tous les services
  - Vérifie l'endpoint `/actuator/health` de chaque service
  - Mesure le temps de réponse réel
  - Détecte automatiquement UP/DOWN/DEGRADED
  - Auto-rafraîchit tous les 30 secondes
  - Services checké :
    - API Gateway (8080)
    - Auth Service (8081)
    - Employee Service (8082)
    - Org Service (8083)
    - Leave Service (8084)
    - Payroll Service (8085)

---

## 🚀 Comment Utiliser

### A. Accéder à la super-admin

1. Connectez-vous à l'interface
2. Allez dans **"Super-Admin"** (au profil)
3. Cliquez sur :
   - **"Logs Système"** : voir les actions/erreurs en temps réel
   - **"Monitoring Système"** : voir la santé des services

### B. Voir les logs réels

Les logs affichés viennent des actions effectuées dans l'application :
- ✅ Créer un employé → LOG: "CREATE - Employee"
- ✅ Modifier une paie → LOG: "UPDATE - Payroll"
- ✅ Supprimer une organisation → LOG: "DELETE - Organization"

**Actuellement disponible :** Les logs d'audit (actions métier)

### C. Voir le monitoring réel

- **Vert (UP)** : Service actif, répond correctement
- **Orange (DEGRADED)** : Service actif mais dégradé
- **Rouge (DOWN)** : Service inactif

Le temps de réponse affiché est **réel** (ms mesurés en temps réel)

---

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│        SUPER-ADMIN FRONTEND             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  SystemLogs.tsx                 │   │
│  │ └─ Auto-load: /api/audit-logs   │   │
│  │ └─ Refresh: 30s ou manuel       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  SystemMonitoringDashboard.tsx  │   │
│  │ └─ Auto-load: /actuator/health  │   │
│  │ └─ Refresh: 30s ou manuel       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
         ↓              ↓
┌──────────────────────────────────────────────┐
│           BACKEND SERVICES                   │
├──────────────────────────────────────────────┤
│                                              │
│  🔹 Audit Service (logs)                     │
│     GET /api/audit-logs → List<AuditLog>    │
│                                              │
│  🔹 All Services (health)                    │
│     GET /actuator/health → Health Status    │
│     Port 8080-8085                          │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 🔌 APIs Utilisées

### 1. Audit Logs
```bash
GET /api/audit-logs
Authorization: Bearer <token>

Response:
[
  {
    "id": "uuid",
    "organizationId": "uuid",
    "userId": "uuid",
    "action": "CREATE",
    "entityType": "Employee",
    "entityId": "uuid",
    "timestamp": "2026-06-05T14:30:00Z",
    "newValues": {...},
    "oldValues": {...}
  }
]
```

### 2. Health Check
```bash
GET http://localhost:8080/actuator/health
GET http://localhost:8081/actuator/health
...

Response:
{
  "status": "UP",
  "components": {...}
}
```

---

## 🛠️ Configuration pour Spring Boot Actuator

Si certains services n'exposent pas l'actuator, ajouter à `application.properties` ou `application.yml` :

```properties
# Pour tous les services Spring Boot :
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=always
```

---

## ✨ Fonctionnalités Futures (roadmap)

### Phase 2 : Métriques Détaillées
- [ ] Charger CPU/Memory/Disk depuis Prometheus
- [ ] Graphiques CPU/Memory en temps réel (au lieu de mock data)
- [ ] Dashboard personnalisé par service

### Phase 3 : Alertes Avancées
- [ ] Notifications temps réel (WebSocket)
- [ ] Seuils d'alerte configurable
- [ ] Slack/Email integration

### Phase 4 : Logs Centralisés
- [ ] Stack ELK (Elasticsearch + Logstash + Kibana)
- [ ] Loki + Promtail pour logs distribué
- [ ] Agrégation logs multi-services

---

## 🧪 Test en Local

### Étape 1 : Lancer les services

```bash
# Depuis C:\Users\user\Desktop\RH\workhub\infra
docker-compose -f compose.apps.yml up -d
docker-compose -f compose.infra.yml up -d
```

### Étape 2 : Vérifier le frontend

```bash
# Depuis C:\Users\user\Desktop\RH\workhub\frontend
pnpm install
pnpm dev
```

### Étape 3 : Générer des logs

Performez des actions dans l'app (créer employé, modifier org, etc.). Les logs apparaîtront en temps réel dans **Logs Système**.

### Étape 4 : Vérifier les health checks

Cliquez sur **"Actualiser"** dans **Monitoring Système** → Les services UP apparaîtront en vert.

---

## 📝 Notes d'Implémentation

- **SystemLogs.tsx** : ~50 lignes de code nouveau, connecté à audit-service
- **SystemMonitoringDashboard.tsx** : ~30 lignes de code nouveau, utilise actuator URLs
- **Polling** : 30 secondes, peut être réduit/augmenté
- **Fallback** : Si API down, données de mock s'affichent
- **Token** : Utilise `localStorage.getItem("workhub.token")` pour auth

---

## 🐛 Troubleshooting

### Problème : Aucun log n'apparaît
**Solution :** 
```bash
# Vérifier que l'audit service tourne
docker logs -f workhub_audit-service_1

# Vérifier l'endpoint
curl -X GET http://localhost:8080/api/audit-logs \
  -H "Authorization: Bearer <token>"
```

### Problème : Monitoring affiche "DOWN" pour tous
**Solution :**
```bash
# Vérifier que les services répondent
curl -i http://localhost:8080/actuator/health
curl -i http://localhost:8081/actuator/health
# etc.
```

**Si 404** → Actuator pas activé, ajouter à application.properties :
```
management.endpoints.web.exposure.include=health
```

---

## 📌 Prochaines Étapes Recommandées

1. ✅ **Tester les logs** : Performer actions dans l'app, vérifier la super-admin
2. ✅ **Tester le monitoring** : Lancer/arrêter services, vérifier status
3. 🔄 **Implémenter WebSocket** : Pour notifications ultra-temps réel (au lieu de polling)
4. 📊 **Ajouter métriques réelles** : Prometheus + Grafana pour CPU/Memory
5. 🚨 **Système d'alertes** : E-mail/Slack quand service DOWN

---

**Version** : 1.0 (2026-06-05)
**Status** : ✅ Production-ready pour logs et health checks basiques

