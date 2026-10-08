import { canDeactivateBed, isManualStatusChangeAllowed, MANUAL_BED_STATUSES } from "../bedRules";

describe("bed rules", () => {
  it("never offers occupied as a manual status", () => {
    expect(MANUAL_BED_STATUSES).toEqual(["vacant", "reserved", "maintenance"]);
  });

  it("blocks manually moving a bed into occupied", () => {
    expect(isManualStatusChangeAllowed("vacant", "occupied")).toBe(false);
    expect(isManualStatusChangeAllowed("maintenance", "occupied")).toBe(false);
  });

  it("allows other edits, including keeping an occupied bed occupied", () => {
    expect(isManualStatusChangeAllowed("maintenance", "vacant")).toBe(true);
    expect(isManualStatusChangeAllowed("occupied", "occupied")).toBe(true);
  });

  it("only deactivates beds that are not occupied", () => {
    expect(canDeactivateBed("occupied")).toBe(false);
    expect(canDeactivateBed("reserved")).toBe(true);
  });
});
