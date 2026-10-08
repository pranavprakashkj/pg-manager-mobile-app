import type { Bed, BedStatus, Building, Floor, Room } from "./entities";

/**
 * Pure inventory derivations for the V2 Rooms experience.
 * No Firestore or UI imports — input is plain domain entities.
 */

export interface BedCounts {
  total: number;
  occupied: number;
  vacant: number;
  reserved: number;
  maintenance: number;
}

export interface RoomNode {
  room: Room;
  beds: Bed[];
  counts: BedCounts;
}

export interface FloorNode {
  floor: Floor;
  rooms: RoomNode[];
  counts: BedCounts;
}

export interface BuildingNode {
  building: Building;
  floors: FloorNode[];
  counts: BedCounts;
  roomCount: number;
}

export const EMPTY_COUNTS: BedCounts = { total: 0, occupied: 0, vacant: 0, reserved: 0, maintenance: 0 };

export function countBeds(beds: readonly Bed[]): BedCounts {
  const counts = { ...EMPTY_COUNTS };
  for (const bed of beds) {
    counts.total += 1;
    counts[bed.status] += 1;
  }
  return counts;
}

export function sumCounts(list: readonly BedCounts[]): BedCounts {
  return list.reduce<BedCounts>(
    (acc, c) => ({
      total: acc.total + c.total,
      occupied: acc.occupied + c.occupied,
      vacant: acc.vacant + c.vacant,
      reserved: acc.reserved + c.reserved,
      maintenance: acc.maintenance + c.maintenance,
    }),
    { ...EMPTY_COUNTS }
  );
}

/** Whole-number occupancy percentage (occupied ÷ all active beds). 0 when there are no beds. */
export function occupancyRate(counts: BedCounts): number {
  return counts.total === 0 ? 0 : Math.round((counts.occupied / counts.total) * 100);
}

const naturalCompare = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

/**
 * Builds Building → Floor → Room → Bed from flat, org-scoped lists.
 * Children whose parent is missing (e.g. a deactivated floor) are left out,
 * mirroring how V1 screens only reach active parents.
 */
export function buildInventoryTree(
  buildings: readonly Building[],
  floors: readonly Floor[],
  rooms: readonly Room[],
  beds: readonly Bed[]
): BuildingNode[] {
  const bedsByRoom = new Map<string, Bed[]>();
  for (const bed of beds) {
    const list = bedsByRoom.get(bed.roomId) ?? [];
    list.push(bed);
    bedsByRoom.set(bed.roomId, list);
  }

  const roomsByFloor = new Map<string, RoomNode[]>();
  for (const room of rooms) {
    const roomBeds = (bedsByRoom.get(room.id) ?? []).sort((a, b) => naturalCompare(a.name, b.name));
    const list = roomsByFloor.get(room.floorId) ?? [];
    list.push({ room, beds: roomBeds, counts: countBeds(roomBeds) });
    roomsByFloor.set(room.floorId, list);
  }

  const floorsByBuilding = new Map<string, FloorNode[]>();
  for (const floor of floors) {
    const floorRooms = (roomsByFloor.get(floor.id) ?? []).sort((a, b) =>
      naturalCompare(a.room.roomNumber, b.room.roomNumber)
    );
    const list = floorsByBuilding.get(floor.buildingId) ?? [];
    list.push({ floor, rooms: floorRooms, counts: sumCounts(floorRooms.map((r) => r.counts)) });
    floorsByBuilding.set(floor.buildingId, list);
  }

  return [...buildings]
    .sort((a, b) => naturalCompare(a.name, b.name))
    .map((building) => {
      const buildingFloors = (floorsByBuilding.get(building.id) ?? []).sort(
        (a, b) => a.floor.sortOrder - b.floor.sortOrder
      );
      return {
        building,
        floors: buildingFloors,
        counts: sumCounts(buildingFloors.map((f) => f.counts)),
        roomCount: buildingFloors.reduce((n, f) => n + f.rooms.length, 0),
      };
    });
}

export function totalCounts(tree: readonly BuildingNode[]): BedCounts {
  return sumCounts(tree.map((b) => b.counts));
}

export function totalRooms(tree: readonly BuildingNode[]): number {
  return tree.reduce((n, b) => n + b.roomCount, 0);
}

/** Rooms-tab filter. Each value is a bed status; "all" shows everything. */
export type InventoryFilter = "all" | Exclude<BedStatus, "occupied">;

function roomMatchesFilter(node: RoomNode, filter: InventoryFilter): boolean {
  return filter === "all" || node.counts[filter] > 0;
}

/** Number of rooms each filter chip would show. */
export function countRoomsByFilter(tree: readonly BuildingNode[]): Record<InventoryFilter, number> {
  const result: Record<InventoryFilter, number> = { all: 0, vacant: 0, reserved: 0, maintenance: 0 };
  for (const b of tree) {
    for (const f of b.floors) {
      for (const r of f.rooms) {
        result.all += 1;
        if (r.counts.vacant > 0) result.vacant += 1;
        if (r.counts.reserved > 0) result.reserved += 1;
        if (r.counts.maintenance > 0) result.maintenance += 1;
      }
    }
  }
  return result;
}

const includes = (haystack: string, needle: string) => haystack.toLowerCase().includes(needle);

/**
 * Narrows the tree by status filter and free-text search over building, floor,
 * room and bed names. A building or floor name match keeps all of its rooms.
 * Buildings and floors with nothing left are removed, except that with no
 * filter and no query the tree is returned unchanged (so empty buildings show).
 */
export function filterInventory(
  tree: readonly BuildingNode[],
  { filter, query }: { filter: InventoryFilter; query: string }
): BuildingNode[] {
  const q = query.trim().toLowerCase();
  if (filter === "all" && !q) return [...tree];

  const result: BuildingNode[] = [];
  for (const b of tree) {
    const buildingHit = !!q && includes(b.building.name, q);
    const floors: FloorNode[] = [];
    for (const f of b.floors) {
      const floorHit = buildingHit || (!!q && includes(f.floor.name, q));
      const rooms = f.rooms.filter((r) => {
        if (!roomMatchesFilter(r, filter)) return false;
        if (!q || floorHit) return true;
        return includes(r.room.roomNumber, q) || includes(`room ${r.room.roomNumber}`, q) || r.beds.some((bed) => includes(bed.name, q));
      });
      if (rooms.length > 0) {
        floors.push({ ...f, rooms, counts: sumCounts(rooms.map((r) => r.counts)) });
      }
    }
    if (floors.length > 0) {
      result.push({
        ...b,
        floors,
        counts: sumCounts(floors.map((f) => f.counts)),
        roomCount: floors.reduce((n, f) => n + f.rooms.length, 0),
      });
    }
  }
  return result;
}

/** Min/max default monthly rate across beds, or null when there are none. */
export function monthlyRateRange(beds: readonly Bed[]): { min: number; max: number } | null {
  if (beds.length === 0) return null;
  let min = Infinity;
  let max = -Infinity;
  for (const b of beds) {
    min = Math.min(min, b.defaultMonthlyRate);
    max = Math.max(max, b.defaultMonthlyRate);
  }
  return { min, max };
}

/**
 * Short code for a bed tile disc: "Bed A" → "A", "B-12" → "B12", "Window" → "WIN".
 */
export function bedCode(name: string): string {
  const stripped = name.replace(/^\s*bed\b[\s\-_:#]*/i, "").replace(/[^a-z0-9]/gi, "");
  const source = stripped || name.replace(/[^a-z0-9]/gi, "") || "?";
  return source.slice(0, 3).toUpperCase();
}

export function findRoom(tree: readonly BuildingNode[], roomId: string) {
  for (const b of tree) {
    for (const f of b.floors) {
      const node = f.rooms.find((r) => r.room.id === roomId);
      if (node) return { building: b.building, floor: f.floor, node };
    }
  }
  return null;
}

export function findFloor(tree: readonly BuildingNode[], floorId: string) {
  for (const b of tree) {
    const node = b.floors.find((f) => f.floor.id === floorId);
    if (node) return { building: b.building, node };
  }
  return null;
}

/** Room has at least one bed that is not occupied — shown expanded on the Rooms tab. */
export function hasOpenBeds(node: RoomNode): boolean {
  return node.counts.total > node.counts.occupied;
}
