import { ApiError } from "@/lib/api/fetcher";

export function getErrorMessage(
  error: unknown,
  fallback = "Errors occured."
): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

export function getErrorCode(
  error: unknown,
  fallback = "UNKNOWN_ERROR"
): string {
  if (error instanceof ApiError) {
    return error.body.error.code || error.name || fallback;
  }
  return fallback;
}

/**
 * Mengubah format SCREAMING_SNAKE_CASE menjadi format kalimat biasa
 */
export function getReadableErrorCode(error: unknown): string | null {
  const code = getErrorCode(error, "");

  const whiteList = [
    "DEMO_MODE_RESTRICTION",
    "SUBSCRIPTION_EXPIRED",
    "INSUFFICIENT_PERMISSIONS",
  ];

  if (!code || !whiteList.includes(code)) {
    return "Oops! Something went wrong"; // Tidak menampilkan judul jika tidak terdaftar
  }

  return code
    .toLowerCase()
    .replace(/_/g, " ") // Ganti underscore dengan spasi
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize tiap kata
}
