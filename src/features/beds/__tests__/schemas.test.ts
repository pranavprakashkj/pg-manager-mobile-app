import { bedSchema } from "../schemas";

describe("Bed Schema", () => {
  it("validates correct bed input", () => {
    expect(() => bedSchema.parse({ name: "A", defaultMonthlyRate: 8500, defaultDailyRate: 500 })).not.toThrow();
  });

  it("fails on negative rates", () => {
    const result = bedSchema.safeParse({ name: "A", defaultMonthlyRate: -1, defaultDailyRate: 500 });
    expect(result.success).toBe(false);
  });
});
