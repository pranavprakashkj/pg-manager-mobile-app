import { roomSchema } from "../schemas/room";

describe("Room Schema", () => {
  it("validates correct room input", () => {
    expect(() => roomSchema.parse({ roomNumber: "101" })).not.toThrow();
  });

  it("fails on empty room number", () => {
    const result = roomSchema.safeParse({ roomNumber: "  " });
    expect(result.success).toBe(false);
  });
});
