/**
 * Extracts a human-readable error message from an unknown error value.
 *
 * Handles standard Error instances, Firebase errors (which have a `code`
 * property), and arbitrary thrown values.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
