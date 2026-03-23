import { useCallback } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

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
  const tCommon = useTranslations("Common")

  const handleError = useCallback((err: unknown, fallback?: string) => {
    const message = getErrorMessage(err) || fallback || tCommon("anErrorOccurred")
    toast.error(message)
    console.error(message, err)
  }, [tCommon])

  return { handleError }
}
