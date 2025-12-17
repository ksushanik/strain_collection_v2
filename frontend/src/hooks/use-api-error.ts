import { useCallback } from "react"
import { toast } from "sonner"

function getErrorMessage(err: unknown): string | null {
  if (!err) return null
  if (err instanceof Error) return err.message
  if (typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message
    return typeof message === "string" ? message : null
  }
  return null
}

export function useApiError() {
  const handleError = useCallback((err: unknown, fallback = "Произошла ошибка") => {
    const message = getErrorMessage(err) || fallback
    toast.error(message)
    console.error(message, err)
  }, [])

  return { handleError }
}
