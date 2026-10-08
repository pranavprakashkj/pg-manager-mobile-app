import { resolveRedirect } from "../resolveRedirect";

describe("resolveRedirect", () => {
  describe("signed out", () => {
    it("sends any non-auth route to login", () => {
      expect(resolveRedirect({ isAuthenticated: false, selectionState: "loading", segments: ["(tabs)"] })).toBe("/(auth)/login");
      expect(resolveRedirect({ isAuthenticated: false, selectionState: "selected", segments: ["room", "[id]"] })).toBe(
        "/(auth)/login"
      );
    });

    it("stays on auth screens", () => {
      expect(resolveRedirect({ isAuthenticated: false, selectionState: "loading", segments: ["(auth)", "login"] })).toBeNull();
    });
  });

  it("does nothing while memberships are loading", () => {
    expect(resolveRedirect({ isAuthenticated: true, selectionState: "loading", segments: ["(tabs)"] })).toBeNull();
  });

  describe("onboarding_required (0 active memberships)", () => {
    it("forces Create Organization", () => {
      expect(resolveRedirect({ isAuthenticated: true, selectionState: "onboarding_required", segments: ["(tabs)"] })).toBe(
        "/organization/create"
      );
      expect(
        resolveRedirect({ isAuthenticated: true, selectionState: "onboarding_required", segments: ["organization", "select"] })
      ).toBe("/organization/create");
    });

    it("stays on Create Organization", () => {
      expect(
        resolveRedirect({ isAuthenticated: true, selectionState: "onboarding_required", segments: ["organization", "create"] })
      ).toBeNull();
    });
  });

  describe("selection_required (2+ memberships, none chosen)", () => {
    it("forces explicit selection — never the tabs", () => {
      expect(resolveRedirect({ isAuthenticated: true, selectionState: "selection_required", segments: ["(tabs)"] })).toBe(
        "/organization/select"
      );
      expect(
        resolveRedirect({ isAuthenticated: true, selectionState: "selection_required", segments: ["building", "[id]"] })
      ).toBe("/organization/select");
    });

    it("stays on the selection screen", () => {
      expect(
        resolveRedirect({ isAuthenticated: true, selectionState: "selection_required", segments: ["organization", "select"] })
      ).toBeNull();
    });
  });

  describe("selected", () => {
    it("moves entry routes into the app", () => {
      for (const segments of [["(auth)", "login"], ["organization", "create"], ["organization", "select"], []]) {
        expect(resolveRedirect({ isAuthenticated: true, selectionState: "selected", segments })).toBe("/(tabs)");
      }
    });

    it("keeps tabs and property workflow screens reachable", () => {
      for (const segments of [
        ["(tabs)"],
        ["(tabs)", "rooms"],
        ["building", "[id]"],
        ["building", "add-floor"],
        ["floor", "[id]"],
        ["room", "[id]"],
        ["room", "edit-bed"],
      ]) {
        expect(resolveRedirect({ isAuthenticated: true, selectionState: "selected", segments })).toBeNull();
      }
    });
  });
});
