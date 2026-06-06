$services = @(
    "api-gateway",
    "org-service",
    "identity-service",
    "employee-service",
    "leave-service",
    "payroll-service",
    "notification-service",
    "audit-service",
    "document-service",
    "recruitment-service"
)

foreach ($service in $services) {
    Write-Host "Building $service..." -ForegroundColor Cyan
    Push-Location "services/$service"
    mvn -T 1C clean package -DskipTests
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed for $service" -ForegroundColor Red
        Pop-Location
        exit $LASTEXITCODE
    }
    Pop-Location
}
Write-Host "All services built successfully!" -ForegroundColor Green
