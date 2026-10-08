import { getErrorMessage } from "../errorUtils";

const GENERIC = "Something went wrong. Please try again.";

describe("getErrorMessage", () => {
  it("passes through our own domain error messages", () => {
    expect(getErrorMessage(new Error("A room with this number already exists on this floor"))).toBe(
      "A room with this number already exists on this floor"
    );
  });

  it("returns plain string errors as-is", () => {
    expect(getErrorMessage("plain string")).toBe("plain string");
  });

  it.each([null, undefined, 42, {}, ""])("falls back to a generic message for %p", (value) => {
    expect(getErrorMessage(value)).toBe(GENERIC);
  });

  it("maps backend permission errors without exposing infrastructure terms", () => {
    const err = Object.assign(new Error("FirebaseError: Missing or insufficient permissions."), {
      code: "permission-denied",
      name: "FirebaseError",
    });
    const message = getErrorMessage(err);
    expect(message).toBe("You don't have access to this. Check that the right organization is selected.");
    expect(message).not.toMatch(/firebase|firestore|permission/i);
  });

  it("maps network failures to a connection message", () => {
    expect(getErrorMessage({ code: "unavailable" })).toMatch(/internet connection/);
    expect(getErrorMessage({ code: "auth/network-request-failed" })).toMatch(/internet connection/);
  });

  it("maps auth credential errors to a single neutral message", () => {
    expect(getErrorMessage({ code: "auth/invalid-credential" })).toBe("Incorrect email or password.");
    expect(getErrorMessage({ code: "auth/user-not-found" })).toBe("Incorrect email or password.");
  });

  it("never leaks unknown backend error text", () => {
    const err = Object.assign(new Error("INTERNAL ASSERTION FAILED: Unexpected state (ID: ca9)"), { code: "internal" });
    expect(getErrorMessage(err)).toBe(GENERIC);
  });
});
