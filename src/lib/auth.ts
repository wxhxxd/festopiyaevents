export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const val = parts.pop()?.split(';').shift();
    return val ? decodeURIComponent(val) : null;
  }
  return null;
}

export function setAuthCredentials(token: string, role: string, companyName: string) {
  if (typeof window === "undefined") return;
  
  // 1. Save in localStorage
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("company_name", companyName);

  // 2. Save in 1-Year long-lived Cookie (365 days persistent across app & website reopens)
  const oneYear = 31536000;
  document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=${oneYear}; SameSite=Lax`;
  document.cookie = `role=${encodeURIComponent(role)}; path=/; max-age=${oneYear}; SameSite=Lax`;
  document.cookie = `company_name=${encodeURIComponent(companyName)}; path=/; max-age=${oneYear}; SameSite=Lax`;

  // 3. Request persistent storage for PWA / Mobile WebViews
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  let token = localStorage.getItem("token");
  if (!token || token === "undefined" || token === "null" || token.trim() === "") {
    token = getCookie("token");
  }
  if (!token || token === "undefined" || token === "null" || token.trim() === "") return null;
  return token;
}

export function getStoredRole(): string | null {
  if (typeof window === "undefined") return null;
  let role = localStorage.getItem("role");
  if (!role || role === "undefined" || role === "null" || role.trim() === "") {
    role = getCookie("role");
  }
  if (!role || role === "undefined" || role === "null" || role.trim() === "") return null;
  return role;
}

export function getStoredCompanyName(): string | null {
  if (typeof window === "undefined") return null;
  let company = localStorage.getItem("company_name");
  if (!company || company === "undefined" || company === "null" || company.trim() === "") {
    company = getCookie("company_name");
  }
  if (!company || company === "undefined" || company === "null" || company.trim() === "") return null;
  return company;
}

export function clearAuthCredentials() {
  if (typeof window === "undefined") return;
  
  // 1. Clear localStorage & sessionStorage
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("company_name");
  try {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("company_name");
  } catch (e) {}

  // 2. Comprehensive Cookie Clearing (handles SameSite=Lax, max-age=0, paths, domains)
  const keys = ["token", "role", "company_name"];
  const paths = ["/", "/auth", "/organizer", "/vendor"];
  const hostname = window.location.hostname;

  keys.forEach((key) => {
    // Standard clear with max-age=0 and SameSite=Lax
    document.cookie = `${key}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    document.cookie = `${key}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    // Path variations
    paths.forEach((p) => {
      document.cookie = `${key}=; path=${p}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      document.cookie = `${key}=; path=${p}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });

    // Domain variations if hostname exists
    if (hostname) {
      document.cookie = `${key}=; path=/; domain=${hostname}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      document.cookie = `${key}=; path=/; domain=.${hostname}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    }
  });
}
