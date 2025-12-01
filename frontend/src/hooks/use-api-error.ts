import { useCallback } from "react";
import { toast } from "sonner";

export function useApiError() {
  const handleError = useCallback((err: unknown, fallback = "?????? ???????") => {
    const message = err instanceof Error ? err.message : fallback;
    toast.error(message);
    console.error(message, err);
  }, []);

  return { handleError };
}
