import { ApiError } from "@/lib/api/fetcher";

export type FormErrorPayload = {
  message: string;
  fieldErrors?: Record<string, string | string[]>;
};

export function resolveFormError(
  error: unknown,
  fallbackMessage: string
): FormErrorPayload {
  if (error instanceof ApiError) {
    const body = error.body as any;

    return {
      message:
        body?.message ||
        error.message ||
        fallbackMessage,
      fieldErrors:
        body?.errors ||
        body?.error?.errors,
    };
  }

  if (error instanceof Error) {
    return { message: error.message || fallbackMessage };
  }

  return { message: fallbackMessage };
}
