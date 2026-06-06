# Debug Session: login-empty-response

Status: OPEN

## Symptom
- Login request fails with `net::ERR_EMPTY_RESPONSE`
- Target URL observed: `http://localhost:8088/api/auth/login`

## Expected
- Login endpoint returns a JSON auth response or a structured API error

## Hypotheses
- H1: `identity-service` is not running on port `8088`, so the browser connects to a dead or half-open socket.
- H2: `identity-service` starts but crashes when handling `/api/auth/login`, causing an empty response.
- H3: the local stack was not restarted after config changes, so frontend and backend are out of sync.
- H4: port `8088` is occupied by another process that accepts then drops the connection.
- H5: the service is running but failing very early during request parsing or security filter handling, before producing JSON.

## Evidence Plan
- Check running processes / containers for `identity-service`
- Verify listeners on port `8088`
- Query the endpoint directly from terminal
- Inspect runtime logs from the identity service

## Notes
- No business-logic fix applied in this debug session yet.

## Evidence
- Docker container `infra-identity-service-1` is running and published on `8088`
- Direct terminal POST to `http://localhost:8088/api/auth/login` returns `401`, so the service responds normally outside browser CORS
- Simulated browser preflight from `http://localhost:5173` returns `403`
- Runtime log confirms `originAllowed=false` for `/api/auth/login`

## Hypothesis Status
| ID | Hypothesis | Status | Evidence Summary |
|----|------------|--------|------------------|
| A | `identity-service` is down on `8088` | Rejected | Container is up and port `8088` listens |
| B | Service crashes on login request | Rejected | Terminal POST gets `401`, not empty response |
| C | Front/back config mismatch after restart | Inconclusive | Not needed to explain the failure |
| D | Another process occupies `8088` | Rejected | Requests reach the identity service container |
| E | Browser-side CORS rejection on origin `5173` | Confirmed | Preflight `403` and debug log shows `originAllowed=false` |

## Post-Fix Evidence
- Updated `identity-service` CORS allowlist to include `http://localhost:5173`
- Simulated browser preflight from `http://localhost:5173` now returns `200`
- Browser-like POST now reaches the login endpoint and returns structured JSON `401` instead of failing at transport/CORS level
- Post-fix runtime log confirms `originAllowed=true` for both `OPTIONS` and `POST` on `/api/auth/login`
