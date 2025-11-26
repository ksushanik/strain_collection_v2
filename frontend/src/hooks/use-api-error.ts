import { toast } from "sonner";

export function useApiError() {
  const handleError = (err: unknown, fallback = "Ошибка запроса") => {
    const message =
      err && typeof err === "object" && "message" in err && typeof (err as any).message === "string"
        ? (err as any).message
        : fallback;
    toast.error(message);
    console.error(message, err);
  };

  return { handleError };
}
