import type { OrganizationSelectionState } from "../stores/organizationStore";

export type RedirectTarget = "/(auth)/login" | "/organization/create" | "/organization/select" | "/(tabs)";

interface RedirectInput {
  isAuthenticated: boolean;
  selectionState: OrganizationSelectionState;
  /** Expo Router segments for the current route. */
  segments: readonly string[];
}

/**
 * Route guard for the root navigator. Returns where to send the user, or
 * null to stay put. Kept pure so the auth/tenant rules are unit-testable.
 *
 * Once an organization is selected, only the entry routes (auth, onboarding,
 * selection, index) bounce to the tabs — property screens such as
 * /building/[id] or /room/[id] must stay reachable.
 */
export function resolveRedirect({ isAuthenticated, selectionState, segments }: RedirectInput): RedirectTarget | null {
  const [first, second] = segments;
  const inAuth = first === "(auth)";
  const inOrganization = first === "organization";

  if (!isAuthenticated) return inAuth ? null : "/(auth)/login";

  switch (selectionState) {
    case "loading":
      return null;
    case "onboarding_required":
      return inOrganization && second === "create" ? null : "/organization/create";
    case "selection_required":
      return inOrganization && second === "select" ? null : "/organization/select";
    case "selected":
      return inAuth || inOrganization || first === undefined ? "/(tabs)" : null;
  }
}
