import { useCallback } from "react";
import { toast } from "sonner";

export function useApiError() {
  const handleError = useCallback((err: unknown, fallback = "Произошла ошибка") => {
    const message = err instanceof Error ? err.message : (err as any)?.message || fallback;
    toast.error(message);
    console.error(message, err);
  }, []);

  return { handleError };
}
