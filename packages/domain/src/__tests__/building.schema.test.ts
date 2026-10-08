import { buildingSchema, validateBuildingInput } from "../schemas/building";

describe("buildingSchema", () => {
  it("accepts a valid building name", () => {
    const result = buildingSchema.safeParse({ name: "Block A" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Block A");
    }
  });

  it("trims whitespace from the name", () => {
    const result = buildingSchema.safeParse({ name: "  Block B  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Block B");
    }
  });

  it("rejects an empty name", () => {
    const result = buildingSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only name", () => {
    const result = buildingSchema.safeParse({ name: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects a name exceeding 100 characters", () => {
    const result = buildingSchema.safeParse({ name: "A".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("accepts a name at exactly 100 characters", () => {
    const result = buildingSchema.safeParse({ name: "A".repeat(100) });
    expect(result.success).toBe(true);
  });
});

describe("validateBuildingInput", () => {
  it("returns cleaned data for valid input", () => {
    const result = validateBuildingInput({ name: "  Main Block  " });
    expect(result.name).toBe("Main Block");
  });

  it("throws for invalid input", () => {
    expect(() => validateBuildingInput({ name: "" })).toThrow();
  });

  it("throws for missing name", () => {
    expect(() => validateBuildingInput({})).toThrow();
  });
});
