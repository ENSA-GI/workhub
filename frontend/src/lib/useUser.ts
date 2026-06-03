import { useState, useEffect } from "react";

export interface UserObject {
  id: string;
  firstName?: string;
  lastName?: string;
  primaryEmailAddress?: { emailAddress: string };
  publicMetadata: {
    employeeId: string;
    orgId: string;
    role?: string;
  };
  unsafeMetadata: {
    employeeId: string;
  };
}

const LOCAL_USER_FALLBACKS: Record<string, { firstName: string; lastName: string }> = {
  "990e8400-e29b-41d4-a716-446655440000": { firstName: "Mohammed", lastName: "El Amrani" },
  "880e8400-e29b-41d4-a716-446655440000": { firstName: "Fatima", lastName: "Zahra" },
  "770e8400-e29b-41d4-a716-446655440000": { firstName: "Youssef", lastName: "Bennani" },
  "660e8400-e29b-41d4-a716-446655440000": { firstName: "Super", lastName: "Admin" },
};

let cachedEmployeeId: string | null = null;
let cachedUserId: string | null = null;

export function useUser() {
  const token = localStorage.getItem("workhub.token");
  const [user, setUser] = useState<UserObject | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsLoaded(true);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.sub;
      const orgId = payload.org_id || "";
      const email = payload.email || "";
      const role = payload.role || "";
      
      const fallback = LOCAL_USER_FALLBACKS[userId] || { firstName: "", lastName: "" };
      const firstName = payload.first_name || fallback.firstName;
      const lastName = payload.last_name || fallback.lastName;

      // Hardcoded fallback for the seeded dev employee
      let employeeId = "";
      if (userId === "990e8400-e29b-41d4-a716-446655440000") {
        employeeId = "111e8400-e29b-41d4-a716-446655440000";
      } else if (userId === cachedUserId && cachedEmployeeId) {
        employeeId = cachedEmployeeId;
      }

      const initialUser: UserObject = {
        id: userId,
        firstName,
        lastName,
        primaryEmailAddress: { emailAddress: email },
        publicMetadata: { employeeId, orgId, role },
        unsafeMetadata: { employeeId }
      };

      setUser(initialUser);

      if (employeeId) {
        setIsLoaded(true);
        return;
      }

      // If no employeeId found and we have an organization ID, let's query the employee list to resolve it
      if (orgId) {
        fetch(`/employee?organizationId=${orgId}&size=100`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch employees");
            return res.json();
          })
          .then((data) => {
            const employees = data.content || [];
            const matchingEmployee = employees.find((emp: any) => emp.userId === userId);
            if (matchingEmployee) {
              cachedUserId = userId;
              cachedEmployeeId = matchingEmployee.id;
              setUser({
                id: userId,
                firstName,
                lastName,
                primaryEmailAddress: { emailAddress: email },
                publicMetadata: { employeeId: matchingEmployee.id, orgId, role },
                unsafeMetadata: { employeeId: matchingEmployee.id }
              });

            }
            setIsLoaded(true);
          })
          .catch((err) => {
            console.error("Error fetching employee mapping in useUser hook:", err);
            setIsLoaded(true);
          });
      } else {
        setIsLoaded(true);
      }
    } catch (e) {
      console.error("Failed to parse token in useUser:", e);
      setUser(null);
      setIsLoaded(true);
    }
  }, [token]);

  return { user, isLoaded, isSignedIn: !!user };
}
