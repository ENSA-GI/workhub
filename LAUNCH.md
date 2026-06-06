# Commandes de Lancement WorkHub
docker-compose -f infra/compose.infra.yml -f infra/compose.apps.yml up -d --build
docker-compose -f infra/compose.infra.yml -f infra/compose.apps.yml down -v
docker-compose -f infra/compose.infra.yml -f infra/compose.apps.yml up -d --build identity-service


# Arrêter les services et supprimer les volumes anonymes/liés
docker compose -f infra/compose.apps.yml down -v

# Relancer l'ensemble des services proprement
docker compose -f infra/compose.apps.yml up -d --build

Ce document contient les commandes nécessaires pour lancer le projet WorkHub selon différents scénarios.

## Prérequis

- Docker & Docker Compose
- Java 17+
- Node.js 18+
- Python 3.9+

## Scénarios de Lancement

### 1. Lancement Complet avec Docker (Recommandé)

Lance toute l'infrastructure et tous les services applicatifs :

```bash
# Lancer l'infrastructure
docker-compose -f infra/compose.infra.yml up -d

# Attendre que l'infrastructure soit prête (30-60 secondes)

# Lancer les services applicatifs
docker-compose -f infra/compose.apps.yml up -d

# Vérifier les logs
docker-compose -f infra/compose.infra.yml -f infra/compose.apps.yml logs -f
```

**Accès :**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- Kafka UI: http://localhost:8090
- MinIO Console: http://localhost:9001 (minioadmin/minioadminpassword)
- MailHog: http://localhost:8025

### 2. Lancement Infrastructure Seulement

Lance uniquement les services d'infrastructure (PostgreSQL, Redis, Kafka, MinIO, MailHog) :

```bash
docker-compose -f infra/compose.infra.yml up -d

# Arrêter l'infrastructure
docker-compose -f infra/compose.infra.yml down

# Arrêter et supprimer les volumes (données)
docker-compose -f infra/compose.infra.yml down -v
```

### 3. Lancement Applications Seulement (après infrastructure)

Lance les services applicatifs après avoir démarré l'infrastructure :

```bash
# Lancer les services applicatifs
docker-compose -f infra/compose.apps.yml up -d

# Arrêter les applications
docker-compose -f infra/compose.apps.yml down
```

### 4. Développement Local (Services Manuels)

Pour le développement local avec des services lancés manuellement :

#### 4.1. Infrastructure avec Docker

```bash
docker-compose -f infra/compose.infra.yml up -d
```

#### 4.2. Backend Services (Spring Boot)

Chaque service doit être lancé individuellement :

```bash
# API Gateway
cd services/api-gateway
./mvnw spring-boot:run

# Organization Service (terminal séparé)
cd services/org-service
./mvnw spring-boot:run

# Identity Service (terminal séparé)
cd services/identity-service
./mvnw spring-boot:run

# Employee Service (terminal séparé)
cd services/employee-service
./mvnw spring-boot:run

# Leave Service (terminal séparé)
cd services/leave-service
./mvnw spring-boot:run

# Payroll Service (terminal séparé)
cd services/payroll-service
./mvnw spring-boot:run

# Recruitment Service (terminal séparé)
cd services/recruitment-service
./mvnw spring-boot:run

# Document Service (terminal séparé)
cd services/document-service
./mvnw spring-boot:run

# Notification Service (terminal séparé)
cd services/notification-service
./mvnw spring-boot:run

# Audit Service (terminal séparé)
cd services/audit-service
./mvnw spring-boot:run
```

#### 4.3. AI Service (Python FastAPI)

```bash
cd services/ai-service

# Créer un environnement virtuel (si nécessaire)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Lancer le service
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 4.4. Frontend (React)

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Builder pour production
npm run build
```

### 5. Lancement de Services Individuels avec Docker

Lancer un service spécifique avec Docker :

```bash
# Infrastructure seule
docker-compose -f infra/compose.infra.yml up -d postgres redis kafka

# Service spécifique
docker-compose -f infra/compose.apps.yml up -d api-gateway
docker-compose -f infra/compose.apps.yml up -d employee-service
docker-compose -f infra/compose.apps.yml up -d frontend
```

### 6. Reconstruction des Services

Forcer la reconstruction des images Docker :

```bash
# Reconstruire et lancer
docker-compose -f infra/compose.apps.yml build --no-cache
docker-compose -f infra/compose.apps.yml up -d

# Reconstruire un service spécifique
docker-compose -f infra/compose.apps.yml build api-gateway
docker-compose -f infra/compose.apps.yml up -d api-gateway
```

### 7. Nettoyage

Arrêter et nettoyer tous les conteneurs :

```bash
# Arrêter tous les services
docker-compose -f infra/compose.infra.yml -f infra/compose.apps.yml down

# Arrêter et supprimer les volumes (supprime les données)
docker-compose -f infra/compose.infra.yml -f infra/compose.apps.yml down -v

# Supprimer les images orphelines
docker system prune -a
```

### 8. Vérification de l'État

Vérifier l'état des services :

```bash
# Voir les conteneurs en cours
docker-compose -f infra/compose.infra.yml -f infra/compose.apps.yml ps

# Voir les logs d'un service spécifique
docker-compose -f infra/compose.infra.yml logs postgres
docker-compose -f infra/compose.apps.yml logs api-gateway

# Logs en temps réel
docker-compose -f infra/compose.infra.yml -f infra/compose.apps.yml logs -f
```

## Configuration des Variables d'Environnement

Créer un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Variables importantes :
- `CLERK_WEBHOOK_SECRET`: Secret webhook Clerk
- `VITE_CLERK_PUBLISHABLE_KEY`: Clé publique Clerk
- `SPRING_DATASOURCE_USERNAME`: Utilisateur PostgreSQL
- `SPRING_DATASOURCE_PASSWORD`: Mot de passe PostgreSQL

## Ports Utilisés

| Service | Port |
|---------|------|
| Frontend | 3000 |
| API Gateway | 8080 |
| Organization Service | 8081 |
| Identity Service | 8088 |
| Payroll Service | 8084 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Kafka | 9092, 9094 |
| Kafka UI | 8090 |
| MinIO API | 9000 |
| MinIO Console | 9001 |
| MailHog SMTP | 1025 |
| MailHog UI | 8025 |
| AI Service | 8000 |

## Dépannage

### Problèmes de connexion à PostgreSQL

```bash
# Vérifier si PostgreSQL est prêt
docker-compose -f infra/compose.infra.yml logs postgres

# Redémarrer PostgreSQL
docker-compose -f infra/compose.infra.yml restart postgres
```

### Problèmes avec Kafka

```bash
# Vérifier les logs Kafka
docker-compose -f infra/compose.infra.yml logs kafka

# Recréer les topics Kafka
docker-compose -f infra/compose.infra.yml restart kafka-init
```

### Services qui ne démarrent pas

```bash
# Vérifier les logs du service
docker-compose -f infra/compose.apps.yml logs <service-name>

# Reconstruire l'image
docker-compose -f infra/compose.apps.yml build <service-name>
docker-compose -f infra/compose.apps.yml up -d <service-name>
```
