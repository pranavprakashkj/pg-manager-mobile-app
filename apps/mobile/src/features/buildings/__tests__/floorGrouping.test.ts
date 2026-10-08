import { Floor } from "../../../types";

function groupFloorsByBuilding(floors: Floor[]) {
  return floors.reduce((acc, floor) => {
    acc[floor.buildingId] = (acc[floor.buildingId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

describe("floor grouping", () => {
  it("correctly groups floors by building", () => {
    const floors: Floor[] = [
      { id: "f1", buildingId: "b1", isActive: true } as Floor,
      { id: "f2", buildingId: "b1", isActive: true } as Floor,
      { id: "f3", buildingId: "b2", isActive: true } as Floor,
    ];

    const counts = groupFloorsByBuilding(floors);
    expect(counts).toEqual({ b1: 2, b2: 1 });
  });

  it("excludes deactivated floors if they were filtered out upstream", () => {
    const activeFloors: Floor[] = [
      { id: "f1", buildingId: "b1", isActive: true } as Floor,
    ];

    const counts = groupFloorsByBuilding(activeFloors);
    expect(counts).toEqual({ b1: 1 });
  });
});
