# Verification Super Admin - sans afficher le mot de passe
$ErrorActionPreference = 'Stop'
$loginBody = @{ email = 'admin@workhub.com'; password = 'password123' } | ConvertTo-Json
$login = Invoke-RestMethod -Uri 'http://localhost:8088/api/auth/login' -Method POST -Body $loginBody -ContentType 'application/json'
$h = @{ Authorization = "Bearer $($login.token)"; Accept = 'application/json' }

$results = [ordered]@{}
$results.login = $login.user.role
$orgs = Invoke-RestMethod -Uri 'http://localhost:8080/org/orgs?page=0&size=100' -Headers $h
$results.organisations = $orgs.totalElements
$users = Invoke-RestMethod -Uri 'http://localhost:8080/identity/api/users' -Headers $h
$results.utilisateurs = $users.Count

try {
  $logs = Invoke-RestMethod -Uri 'http://localhost:8080/audit/audit-logs' -Headers $h
  $results.audit_logs = $logs.Count
} catch {
  $results.audit_logs = "ERREUR: $($_.Exception.Message)"
}

$emp = 0
foreach ($o in $orgs.content) {
  try {
    $e = Invoke-RestMethod -Uri "http://localhost:8080/employee/employees?organizationId=$($o.id)&status=ACTIVE&page=0&size=1" -Headers $h
    $emp += $e.totalElements
  } catch {}
}
$results.employes_actifs = $emp

$results | ConvertTo-Json -Depth 3
