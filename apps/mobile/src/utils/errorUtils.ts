/**
 * Converts any thrown value into a message that is safe to show users.
 *
 * - Errors thrown by our repositories carry hand-written, user-facing
 *   messages and pass through unchanged.
 * - Backend/SDK errors (anything with a string `code`, e.g. Firebase) are
 *   mapped to plain language so no infrastructure terminology leaks into the UI.
 */
const GENERIC_MESSAGE = "Something went wrong. Please try again.";

const CODE_MESSAGES: Record<string, string> = {
  "permission-denied": "You don't have access to this. Check that the right organization is selected.",
  unauthenticated: "Your session has expired. Please sign in again.",
  unavailable: "Can't reach the server. Check your internet connection and try again.",
  "deadline-exceeded": "The server took too long to respond. Please try again.",
  "not-found": "This item no longer exists. It may have been removed.",
  "already-exists": "This item already exists.",
  "resource-exhausted": "Too many requests right now. Wait a moment and try again.",
  cancelled: "The request was cancelled. Please try again.",
  "failed-precondition": "This action can't be completed right now. Please try again shortly.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/invalid-login-credentials": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/user-disabled": "This account has been disabled. Contact your administrator.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
  "auth/network-request-failed": "Can't reach the server. Check your internet connection and try again.",
  "auth/missing-email": "Enter your email address.",
};

function getCode(error: unknown): string | null {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: unknown }).code;
    if (typeof code === "string" && code.length > 0) return code.replace(/^firestore\//, "");
  }
  return null;
}

export function getErrorMessage(error: unknown): string {
  const code = getCode(error);
  if (code) return CODE_MESSAGES[code] ?? GENERIC_MESSAGE;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.length > 0) return error;
  return GENERIC_MESSAGE;
}
