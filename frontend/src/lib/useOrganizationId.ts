export function useOrganizationId() {
  const token = localStorage.getItem("workhub.token");
  if (!token) return "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.organizationId || payload.org_id || payload.organization_id || "";
  } catch {
    return "";
  }
}
void useOrganizationId;
