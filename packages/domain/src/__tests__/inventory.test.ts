import type { Bed, BedStatus, Building, Floor, Room } from "../entities";
import {
  bedCode,
  buildInventoryTree,
  countBeds,
  countRoomsByFilter,
  filterInventory,
  findFloor,
  findRoom,
  hasOpenBeds,
  monthlyRateRange,
  occupancyRate,
  totalCounts,
  totalRooms,
} from "../inventory";

const ORG = "org1";
const ts = new Date(0);

const building = (id: string, name: string): Building => ({
  id, organizationId: ORG, name, isActive: true, createdAt: ts, updatedAt: ts,
});
const floor = (id: string, buildingId: string, name: string, sortOrder: number): Floor => ({
  id, organizationId: ORG, buildingId, name, sortOrder, isActive: true, createdAt: ts, updatedAt: ts,
});
const room = (id: string, floorId: string, buildingId: string, roomNumber: string): Room => ({
  id, organizationId: ORG, buildingId, floorId, roomNumber, isActive: true, createdAt: ts, updatedAt: ts,
});
const bed = (id: string, roomId: string, name: string, status: BedStatus, rate = 8500): Bed => ({
  id, organizationId: ORG, buildingId: "?", floorId: "?", roomId, name, status,
  defaultMonthlyRate: rate, defaultDailyRate: 500, isActive: true, createdAt: ts, updatedAt: ts,
});

// Building A: Ground (101: 4 beds mixed, 102: full), First (201: full). Building B: one empty floor.
const buildings = [building("bB", "Building B"), building("bA", "Building A")];
const floors = [
  floor("fA1", "bA", "First Floor", 1),
  floor("fA0", "bA", "Ground Floor", 0),
  floor("fB0", "bB", "Ground Floor", 0),
  floor("orphan", "gone", "Orphan Floor", 0),
];
const rooms = [
  room("r102", "fA0", "bA", "102"),
  room("r101", "fA0", "bA", "101"),
  room("r201", "fA1", "bA", "201"),
  room("r10", "fA0", "bA", "10"),
];
const beds = [
  bed("b1", "r101", "Bed B", "vacant", 9000),
  bed("b2", "r101", "Bed A", "occupied"),
  bed("b3", "r101", "Bed C", "reserved"),
  bed("b4", "r101", "Bed D", "maintenance"),
  bed("b5", "r102", "Bed A", "occupied"),
  bed("b6", "r102", "Bed B", "occupied"),
  bed("b7", "r201", "Window", "occupied"),
];

const tree = buildInventoryTree(buildings, floors, rooms, beds);

describe("countBeds / occupancyRate", () => {
  it("counts each status", () => {
    expect(countBeds(beds)).toEqual({ total: 7, occupied: 4, vacant: 1, reserved: 1, maintenance: 1 });
  });

  it("rounds occupancy to a whole percent and handles no beds", () => {
    expect(occupancyRate(countBeds(beds))).toBe(57);
    expect(occupancyRate(countBeds([]))).toBe(0);
  });
});

describe("buildInventoryTree", () => {
  it("sorts buildings by name, floors by sortOrder, rooms numerically and beds by name", () => {
    expect(tree.map((b) => b.building.name)).toEqual(["Building A", "Building B"]);
    const a = tree[0];
    expect(a.floors.map((f) => f.floor.name)).toEqual(["Ground Floor", "First Floor"]);
    expect(a.floors[0].rooms.map((r) => r.room.roomNumber)).toEqual(["10", "101", "102"]);
    expect(a.floors[0].rooms[1].beds.map((b) => b.name)).toEqual(["Bed A", "Bed B", "Bed C", "Bed D"]);
  });

  it("rolls counts up from rooms to floors to buildings", () => {
    const a = tree[0];
    expect(a.floors[0].counts).toEqual({ total: 6, occupied: 3, vacant: 1, reserved: 1, maintenance: 1 });
    expect(a.counts.total).toBe(7);
    expect(a.roomCount).toBe(4);
    expect(tree[1].counts.total).toBe(0);
    expect(totalCounts(tree).occupied).toBe(4);
    expect(totalRooms(tree)).toBe(4);
  });

  it("keeps empty buildings and floors but drops children of missing parents", () => {
    expect(tree[1].floors).toHaveLength(1);
    expect(tree[1].floors[0].rooms).toHaveLength(0);
    expect(tree.flatMap((b) => b.floors).some((f) => f.floor.id === "orphan")).toBe(false);
  });
});

describe("filters", () => {
  it("counts rooms per filter chip", () => {
    expect(countRoomsByFilter(tree)).toEqual({ all: 4, vacant: 1, reserved: 1, maintenance: 1 });
  });

  it("returns the tree unchanged with no filter or query (empty buildings still shown)", () => {
    expect(filterInventory(tree, { filter: "all", query: "  " })).toHaveLength(2);
  });

  it("keeps only rooms with a matching bed status, pruning empty floors and buildings", () => {
    const result = filterInventory(tree, { filter: "vacant", query: "" });
    expect(result).toHaveLength(1);
    expect(result[0].floors).toHaveLength(1);
    expect(result[0].floors[0].rooms.map((r) => r.room.roomNumber)).toEqual(["101"]);
    expect(result[0].counts.total).toBe(4);
  });

  it("searches room numbers, 'room N' phrasing and bed names", () => {
    const byNumber = filterInventory(tree, { filter: "all", query: "102" });
    expect(byNumber.flatMap((b) => b.floors.flatMap((f) => f.rooms.map((r) => r.room.id)))).toEqual(["r102"]);
    const byPhrase = filterInventory(tree, { filter: "all", query: "Room 201" });
    expect(byPhrase.flatMap((b) => b.floors.flatMap((f) => f.rooms.map((r) => r.room.id)))).toEqual(["r201"]);
    const byBed = filterInventory(tree, { filter: "all", query: "window" });
    expect(byBed.flatMap((b) => b.floors.flatMap((f) => f.rooms.map((r) => r.room.id)))).toEqual(["r201"]);
  });

  it("a building or floor name match keeps all of its rooms", () => {
    const byFloor = filterInventory(tree, { filter: "all", query: "first floor" });
    expect(byFloor[0].floors.map((f) => f.floor.id)).toEqual(["fA1"]);
    const byBuilding = filterInventory(tree, { filter: "all", query: "building a" });
    expect(byBuilding).toHaveLength(1);
    expect(byBuilding[0].roomCount).toBe(4);
  });

  it("combines filter and query", () => {
    expect(filterInventory(tree, { filter: "reserved", query: "102" })).toEqual([]);
    expect(filterInventory(tree, { filter: "reserved", query: "101" })[0].floors[0].rooms[0].room.id).toBe("r101");
  });
});

describe("lookups and helpers", () => {
  it("finds rooms and floors with their parents", () => {
    const r = findRoom(tree, "r201");
    expect(r?.building.id).toBe("bA");
    expect(r?.floor.id).toBe("fA1");
    expect(findRoom(tree, "missing")).toBeNull();
    expect(findFloor(tree, "fB0")?.building.id).toBe("bB");
    expect(findFloor(tree, "missing")).toBeNull();
  });

  it("reports the monthly rate range", () => {
    expect(monthlyRateRange(beds.filter((b) => b.roomId === "r101"))).toEqual({ min: 8500, max: 9000 });
    expect(monthlyRateRange([])).toBeNull();
  });

  it("derives short bed codes", () => {
    expect(bedCode("Bed A")).toBe("A");
    expect(bedCode("bed-12")).toBe("12");
    expect(bedCode("B-12")).toBe("B12");
    expect(bedCode("Window")).toBe("WIN");
    expect(bedCode("Bed")).toBe("BED");
    expect(bedCode("—")).toBe("?");
  });

  it("flags rooms with any non-occupied bed", () => {
    const [r10, r101, r102] = tree[0].floors[0].rooms;
    expect(hasOpenBeds(r10)).toBe(false);
    expect(hasOpenBeds(r101)).toBe(true);
    expect(hasOpenBeds(r102)).toBe(false);
  });
});
