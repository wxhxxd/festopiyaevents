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
  return localStorage.getItem("token") || getCookie("token");
}

export function getStoredRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("role") || getCookie("role");
}

export function getStoredCompanyName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("company_name") || getCookie("company_name");
}

export function clearAuthCredentials() {
  if (typeof window === "undefined") return;
  
  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("company_name");

  // Clear Cookies
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
  document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
  document.cookie = "company_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
}
