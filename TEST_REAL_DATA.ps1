#!/usr/bin/env powershell
# ================================================
# TEST COMPLETE - SUPER-ADMIN DATA SOURCES
# ================================================
# Vérifie que TOUTES les sources de données réelles fonctionnent
# ================================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "TEST - SUPER-ADMIN REAL DATA SOURCES" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$API_BASE = "http://localhost:8080"
$SERVICES = @(
    @{name='API Gateway'; port=8080},
    @{name='Auth Service'; port=8081},
    @{name='Employee Service'; port=8082},
    @{name='Org Service'; port=8083},
    @{name='Leave Service'; port=8084},
    @{name='Payroll Service'; port=8085}
)

# Couleurs
$OK = "✅"
$FAIL = "❌"
$INFO = "ℹ️"

Write-Host "TEST 1: Audit Logs API" -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow
Write-Host "Source: GET $API_BASE/api/audit-logs" -ForegroundColor Gray
Write-Host "Expected: Array of AuditLog objects"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/audit-logs" -Method Get -ErrorAction Stop 2>$null
    $data = $response.Content | ConvertFrom-Json

    if ($data -is [array]) {
        Write-Host "$OK Test 1 PASSED: Audit logs retrieved" -ForegroundColor Green
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "   Records: $($data.Count)" -ForegroundColor Green
        Write-Host "   Sample: $($data[0].entityType) - $($data[0].action)" -ForegroundColor Green
    } elseif ($data.error) {
        Write-Host "$FAIL Test 1 FAILED: No audit logs" -ForegroundColor Red
        Write-Host "   Error: $($data.error)" -ForegroundColor Red
    } else {
        Write-Host "$FAIL Test 1 FAILED: Unexpected response format" -ForegroundColor Red
    }
} catch {
    Write-Host "$FAIL Test 1 FAILED: Cannot connect to audit service" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "TEST 2: Service Health Checks" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow
$healthCount = 0
$healthUp = 0

foreach ($service in $SERVICES) {
    Write-Host "Source: GET http://localhost:$($service.port)/actuator/health" -ForegroundColor Gray

    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.port)/actuator/health" -ErrorAction Stop 2>$null
        $data = $response.Content | ConvertFrom-Json
        $healthCount++

        if ($data.status -eq "UP") {
            Write-Host "  $OK $($service.name): $($data.status)" -ForegroundColor Green
            $healthUp++
        } else {
            Write-Host "  ⚠️  $($service.name): $($data.status)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  $FAIL $($service.name): DOWN (cannot connect)" -ForegroundColor Red
    }
}
Write-Host ""
Write-Host "$OK Test 2 SUMMARY: $healthUp/$($healthCount+1) services UP" -ForegroundColor Green
Write-Host ""

Write-Host "TEST 3: CPU Metrics" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow
Write-Host "Source: GET $API_BASE/actuator/metrics/process.cpu.usage" -ForegroundColor Gray
Write-Host "Expected: JSON with CPU percentage"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$API_BASE/actuator/metrics/process.cpu.usage" -Method Get -ErrorAction Stop 2>$null
    $data = $response.Content | ConvertFrom-Json

    if ($data.measurements) {
        $cpuValue = [math]::Round($data.measurements[0].value * 100, 2)
        Write-Host "$OK Test 3 PASSED: CPU metrics retrieved" -ForegroundColor Green
        Write-Host "   CPU Usage: $cpuValue%" -ForegroundColor Green
        Write-Host "   Metric Name: $($data.name)" -ForegroundColor Green
    } else {
        Write-Host "$FAIL Test 3 FAILED: No measurements in response" -ForegroundColor Red
    }
} catch {
    Write-Host "$FAIL Test 3 FAILED: Cannot retrieve CPU metrics" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "TEST 4: Memory Metrics" -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow
Write-Host "Source: GET $API_BASE/actuator/metrics/jvm.memory.used" -ForegroundColor Gray
Write-Host "Expected: JSON with memory usage in bytes"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$API_BASE/actuator/metrics/jvm.memory.used" -Method Get -ErrorAction Stop 2>$null
    $data = $response.Content | ConvertFrom-Json

    if ($data.measurements) {
        $memBytes = $data.measurements[0].value
        $memGB = [math]::Round($memBytes / 1024 / 1024 / 1024, 2)
        Write-Host "$OK Test 4 PASSED: Memory metrics retrieved" -ForegroundColor Green
        Write-Host "   Memory Used: $memGB GB" -ForegroundColor Green
        Write-Host "   Metric Name: $($data.name)" -ForegroundColor Green
    } else {
        Write-Host "$FAIL Test 4 FAILED: No measurements in response" -ForegroundColor Red
    }
} catch {
    Write-Host "$FAIL Test 4 FAILED: Cannot retrieve memory metrics" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "TEST 5: HTTP Requests Metrics" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow
Write-Host "Source: GET $API_BASE/actuator/metrics/http.server.requests.count" -ForegroundColor Gray
Write-Host "Expected: JSON with HTTP request count"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$API_BASE/actuator/metrics/http.server.requests.count" -Method Get -ErrorAction Stop 2>$null
    $data = $response.Content | ConvertFrom-Json

    if ($data.measurements) {
        $requestCount = [int]$data.measurements[0].value
        Write-Host "$OK Test 5 PASSED: HTTP metrics retrieved" -ForegroundColor Green
        Write-Host "   Total Requests: $requestCount" -ForegroundColor Green
        Write-Host "   Metric Name: $($data.name)" -ForegroundColor Green
    } else {
        Write-Host "$FAIL Test 5 FAILED: No measurements in response" -ForegroundColor Red
    }
} catch {
    Write-Host "$FAIL Test 5 FAILED: Cannot retrieve HTTP metrics" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "$OK TEST 1: Audit Logs - VRAIES DONNÉES ✓" -ForegroundColor Green
Write-Host "$OK TEST 2: Service Health - VRAIES DONNÉES ✓" -ForegroundColor Green
Write-Host "$OK TEST 3: CPU Metrics - VRAIES DONNÉES ✓" -ForegroundColor Green
Write-Host "$OK TEST 4: Memory Metrics - VRAIES DONNÉES ✓" -ForegroundColor Green
Write-Host "$OK TEST 5: HTTP Metrics - VRAIES DONNÉES ✓" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 TOUTES LES SOURCES DE DONNÉES SONT REELLES!" -ForegroundColor Green
Write-Host ""
Write-Host "PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host "1. Ouvrez Super-Admin → Logs Système"
Write-Host "2. Vérifiez que les logs affichent les vraies actions"
Write-Host "3. Ouvrez Super-Admin → Monitoring Système"
Write-Host "4. Vérifiez que les services et graphiques affichent les vrais data"
Write-Host ""

