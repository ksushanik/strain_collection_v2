import { User } from "@/types/domain"

export function hasPermission(
  user: User | null | undefined,
  subject: string,
  action: string,
) {
  if (user?.role === "ADMIN") return true

  const permissions = user?.permissions
  if (!permissions) return false

  const allActions = permissions.all || []
  if (allActions.includes("manage") || allActions.includes(action)) {
    return true
  }

  const subjectActions = permissions[subject] || []
  if (subjectActions.includes("manage")) return true
  return subjectActions.includes(action)
}

export function canRead(user: User | null | undefined, subject: string) {
  return hasPermission(user, subject, "read")
}
