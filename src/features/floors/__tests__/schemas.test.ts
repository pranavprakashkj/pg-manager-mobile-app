import {
  floorSchema,
  floorCreateSchema,
  validateFloorInput,
  validateFloorCreateInput,
} from "../schemas";

describe("floorSchema", () => {
  it("accepts a valid floor name", () => {
    const result = floorSchema.safeParse({ name: "Ground Floor" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Ground Floor");
    }
  });

  it("trims whitespace from the name", () => {
    const result = floorSchema.safeParse({ name: "  First Floor  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("First Floor");
    }
  });

  it("rejects an empty name", () => {
    const result = floorSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only name", () => {
    const result = floorSchema.safeParse({ name: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects a name exceeding 100 characters", () => {
    const result = floorSchema.safeParse({ name: "F".repeat(101) });
    expect(result.success).toBe(false);
  });
});

describe("floorCreateSchema", () => {
  it("accepts valid floor creation data", () => {
    const result = floorCreateSchema.safeParse({
      name: "Second Floor",
      buildingId: "abc123",
      sortOrder: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing buildingId", () => {
    const result = floorCreateSchema.safeParse({
      name: "Second Floor",
      sortOrder: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty buildingId", () => {
    const result = floorCreateSchema.safeParse({
      name: "Second Floor",
      buildingId: "",
      sortOrder: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative sortOrder", () => {
    const result = floorCreateSchema.safeParse({
      name: "Second Floor",
      buildingId: "abc123",
      sortOrder: -1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts sortOrder of 0", () => {
    const result = floorCreateSchema.safeParse({
      name: "Ground Floor",
      buildingId: "abc123",
      sortOrder: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe("validateFloorInput", () => {
  it("returns cleaned data for valid input", () => {
    const result = validateFloorInput({ name: "  Terrace  " });
    expect(result.name).toBe("Terrace");
  });

  it("throws for invalid input", () => {
    expect(() => validateFloorInput({ name: "" })).toThrow();
  });
});

describe("validateFloorCreateInput", () => {
  it("returns cleaned data for valid full input", () => {
    const result = validateFloorCreateInput({
      name: "Ground Floor",
      buildingId: "building-1",
      sortOrder: 0,
    });
    expect(result.buildingId).toBe("building-1");
    expect(result.sortOrder).toBe(0);
  });

  it("throws when buildingId is missing", () => {
    expect(() =>
      validateFloorCreateInput({ name: "Floor", sortOrder: 0 })
    ).toThrow();
  });
});
