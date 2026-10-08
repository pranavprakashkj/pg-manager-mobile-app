import { formatINR, formatINRRange, pluralize } from "../format";

describe("formatINR", () => {
  it.each([
    [0, "₹0"],
    [500, "₹500"],
    [8500, "₹8,500"],
    [145000, "₹1,45,000"],
    [12345678, "₹1,23,45,678"],
    [-2133, "−₹2,133"],
    [8499.6, "₹8,500"],
  ])("formats %p as %p", (input, expected) => {
    expect(formatINR(input)).toBe(expected);
  });

  it("renders a dash for non-numbers", () => {
    expect(formatINR(NaN)).toBe("—");
  });
});

describe("formatINRRange", () => {
  it("collapses equal bounds", () => {
    expect(formatINRRange(8500, 8500)).toBe("₹8,500");
    expect(formatINRRange(8000, 9500)).toBe("₹8,000–₹9,500");
  });
});

describe("pluralize", () => {
  it("handles singular, plural and irregular forms", () => {
    expect(pluralize(1, "bed")).toBe("1 bed");
    expect(pluralize(0, "bed")).toBe("0 beds");
    expect(pluralize(2, "vacancy", "vacancies")).toBe("2 vacancies");
  });
});
