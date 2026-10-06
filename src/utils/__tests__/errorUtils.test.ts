import { getErrorMessage } from "../errorUtils";

describe("getErrorMessage", () => {
  it("returns message from Error instances", () => {
    expect(getErrorMessage(new Error("Something broke"))).toBe("Something broke");
  });

  it("returns string representation for non-Error values", () => {
    expect(getErrorMessage("plain string")).toBe("plain string");
  });

  it("handles null", () => {
    expect(getErrorMessage(null)).toBe("null");
  });

  it("handles undefined", () => {
    expect(getErrorMessage(undefined)).toBe("undefined");
  });

  it("handles numbers", () => {
    expect(getErrorMessage(42)).toBe("42");
  });
});
