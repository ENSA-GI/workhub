# ============================================================
# SCRIPT DE DEMONSTRATION - Identity Service (Workhub)
# ============================================================
# Ce script montre les 4 scénarios principaux du service :
#   1. user.created  -> Création d'un utilisateur en DB
#   2. user.updated  -> Mise à jour d'un utilisateur (upsert)
#   3. user.deleted  -> Désactivation logique (soft-delete)
#   4. Vérification  -> Lecture directe en base PostgreSQL
# ============================================================

$BaseUrl    = "http://localhost:8088"
$WebhookUrl = "$BaseUrl/api/webhooks/clerk"
$Secret     = "dGVzdF9zZWNyZXRfMTIz"   # partie Base64 de whsec_dGVzdF9zZWNyZXRfMTIz

function Build-Signature($id, $ts, $body) {
    $keyBytes  = [System.Convert]::FromBase64String($Secret)
    $toSign    = "$id.$ts.$body"
    $msgBytes  = [System.Text.Encoding]::UTF8.GetBytes($toSign)
    $hmac      = New-Object System.Security.Cryptography.HMACSHA256
    $hmac.Key  = $keyBytes
    $hash      = $hmac.ComputeHash($msgBytes)
    return "v1," + [System.Convert]::ToBase64String($hash)
}

function Send-Webhook($payload) {
    $id  = "msg_" + [Guid]::NewGuid().ToString().Substring(0,8)
    $ts  = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds().ToString()
    $sig = Build-Signature $id $ts $payload

    $headers = @{
        "svix-id"        = $id
        "svix-timestamp" = $ts
        "svix-signature" = $sig
        "Content-Type"   = "application/json"
    }

    try {
        $r = Invoke-RestMethod -Uri $WebhookUrl -Method Post -Headers $headers -Body $payload
        return $r
    } catch {
        Write-Host "  [ERREUR] $_" -ForegroundColor Red
        return $null
    }
}

function Query-DB($sql) {
    return docker exec infra-postgres-1 psql -U workhub -d identity_db -c $sql
}

# ─────────────────────────────────────────────
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  WORKHUB - Demo Identity Service" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# ── ÉTAPE 0 : Health check ──────────────────────────────────
Write-Host ""
Write-Host "[0] Vérification que le service est UP..." -ForegroundColor Yellow
try {
    $h = Invoke-RestMethod -Uri "$BaseUrl/actuator/health"
    Write-Host "    Status : $($h.status)" -ForegroundColor Green
} catch {
    Write-Host "    ERREUR : Le service n'est pas accessible sur $BaseUrl" -ForegroundColor Red
    Write-Host "    Lancez d'abord : docker compose -f infra/compose.infra.yml -f infra/compose.apps.yml up -d identity-service"
    exit 1
}

# ── ÉTAPE 1 : Créer un utilisateur ─────────────────────────
Write-Host ""
Write-Host "[1] user.created -> Inscription d'un nouvel utilisateur..." -ForegroundColor Yellow
$clerkId1 = "user_demo_prof_" + [Guid]::NewGuid().ToString().Substring(0,6)
$body1 = @"
{
  "type": "user.created",
  "data": {
    "id": "$clerkId1",
    "email_addresses": [{ "email_address": "demo.etudiant.$clerkId1@workhub.ma" }],
    "first_name": "Demo",
    "last_name": "Etudiant",
    "image_url": "https://i.pravatar.cc/150?u=$clerkId1"
  }
}
"@
$r1 = Send-Webhook $body1
if ($r1) { Write-Host "    Réponse : $r1" -ForegroundColor Green }

Start-Sleep -Milliseconds 500

# ── ÉTAPE 2 : Mettre à jour le même utilisateur ────────────
Write-Host ""
Write-Host "[2] user.updated -> Mise à jour des infos du même utilisateur..." -ForegroundColor Yellow
$body2 = @"
{
  "type": "user.updated",
  "data": {
    "id": "$clerkId1",
    "email_addresses": [{ "email_address": "demo.etudiant.v2.$clerkId1@workhub.ma" }],
    "first_name": "Demo",
    "last_name": "Etudiant-Updated",
    "image_url": "https://i.pravatar.cc/150?u=updated_$clerkId1"
  }
}
"@
$r2 = Send-Webhook $body2
if ($r2) { Write-Host "    Réponse : $r2" -ForegroundColor Green }

Start-Sleep -Milliseconds 500

# ── ÉTAPE 3 : Désactiver l'utilisateur (soft-delete) ───────
Write-Host ""
Write-Host "[3] user.deleted -> Désactivation logique (soft-delete)..." -ForegroundColor Yellow
$body3 = @"
{
  "type": "user.deleted",
  "data": {
    "id": "$clerkId1"
  }
}
"@
$r3 = Send-Webhook $body3
if ($r3) { Write-Host "    Réponse : $r3" -ForegroundColor Green }

Start-Sleep -Milliseconds 500

# ── ÉTAPE 4 : Vérifier en base de données ──────────────────
Write-Host ""
Write-Host "[4] Verification en base PostgreSQL (identity_db) :" -ForegroundColor Yellow
Write-Host "    SELECT id, email, first_name, last_name, role, active FROM users WHERE clerk_id='$clerkId1';"
Write-Host ""
Query-DB "SELECT id, email, first_name, last_name, role, active FROM users WHERE clerk_id='$clerkId1';"

# ── ÉTAPE 5 : Afficher tous les utilisateurs ───────────────
Write-Host ""
Write-Host "[5] Etat complet de la table users :" -ForegroundColor Yellow
Query-DB "SELECT clerk_id, email, role, active, created_at FROM users ORDER BY created_at DESC LIMIT 10;"

# ── FIN ────────────────────────────────────────────────────
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Demo terminée avec succes !" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Points cles a expliquer au professeur :" -ForegroundColor White
Write-Host "  * Le service écoute des webhooks SIGNES depuis Clerk (authentification externe)" -ForegroundColor Gray
Write-Host "  * Il synchronise les utilisateurs en PostgreSQL via un upsert (create ou update)" -ForegroundColor Gray
Write-Host "  * La suppression est un soft-delete : active=false (traçabilité conservée)" -ForegroundColor Gray
Write-Host "  * Les events sont publiés sur Kafka (user.created, user.updated, user.deactivated)" -ForegroundColor Gray
Write-Host "  * Spring Security valide les JWT via la JWK URI de Clerk sur chaque requête API" -ForegroundColor Gray
Write-Host ""
