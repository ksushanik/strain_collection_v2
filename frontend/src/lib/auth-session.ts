import type { User } from "@/types/domain"

const TOKEN_STORAGE_KEY = "token"
const USER_STORAGE_KEY = "user"

export const AUTH_SESSION_CHANGED_EVENT = "auth:session-changed"

const GUEST_PERMISSIONS: Record<string, string[]> = {
  Strain: ["read"],
  Sample: ["read"],
  Storage: ["read"],
  Media: ["read"],
  Method: ["read"],
  TraitDefinition: ["read"],
  Legend: ["read"],
  Wiki: ["read"],
  Analytics: ["read"],
  Photo: ["read"],
}

export function createGuestUser(): User {
  return {
    id: 0,
    email: "guest@local",
    name: "Guest",
    role: "GUEST",
    permissions: GUEST_PERMISSIONS,
  }
}

export function isGuestUser(user: User | null | undefined): boolean {
  return user?.role === "GUEST"
}

function dispatchAuthSessionChanged() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT))
}

function parseStoredUser(raw: string | null): User | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as User
    return parsed && typeof parsed === "object" ? parsed : null
  } catch {
    return null
  }
}

export function readAuthSession(): { token: string | null; user: User | null } {
  if (typeof window === "undefined") {
    return { token: null, user: null }
  }

  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY)
  const user = parseStoredUser(window.localStorage.getItem(USER_STORAGE_KEY))

  if (!user) {
    if (token) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
    window.localStorage.removeItem(USER_STORAGE_KEY)
    return { token: null, user: null }
  }

  if (token || isGuestUser(user)) {
    return { token, user }
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(USER_STORAGE_KEY)
  return { token: null, user: null }
}

export function persistAuthenticatedSession(token: string, user: User): void {
  if (typeof window === "undefined") return

  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  dispatchAuthSessionChanged()
}

export function persistGuestSession(): User {
  const guestUser = createGuestUser()

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(guestUser))
    dispatchAuthSessionChanged()
  }

  return guestUser
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return

  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(USER_STORAGE_KEY)
  dispatchAuthSessionChanged()
}
