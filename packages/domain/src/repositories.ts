import type {
  Bed,
  Building,
  BuildingFormData,
  Floor,
  FloorFormData,
  MembershipStatus,
  Organization,
  OrganizationMember,
  Role,
  Room,
  User,
} from "./entities";
import type { BedFormInput, BedUpdateInput } from "./schemas/bed";
import type { RoomFormInput } from "./schemas/room";

/**
 * Repository contracts — the infrastructure boundary.
 *
 * The mobile app depends only on these interfaces. Today they are implemented
 * with Firebase; after migration the mobile implementation becomes a thin HTTP
 * client and the API implements the server side with Drizzle.
 *
 * Every tenant-owned operation takes `organizationId` explicitly — there is no
 * implicit "current organization" below the UI layer.
 *
 * Errors: implementations throw. Messages thrown for business-rule violations
 * are user-facing; infrastructure errors carry a `code` (see the mobile errorUtils).
 */

export interface BuildingRepository {
  getAll(organizationId: string): Promise<Building[]>;
  /** Throws if missing or owned by another organization. */
  getById(organizationId: string, id: string): Promise<Building>;
  /** Null if missing or owned by another organization. */
  findById(organizationId: string, id: string): Promise<Building | null>;
  create(organizationId: string, data: BuildingFormData): Promise<string>;
  update(organizationId: string, id: string, data: BuildingFormData): Promise<void>;
  deactivate(organizationId: string, id: string): Promise<void>;
}

export interface FloorRepository {
  getAllActive(organizationId: string): Promise<Floor[]>;
  getByBuildingId(organizationId: string, buildingId: string): Promise<Floor[]>;
  getById(organizationId: string, id: string): Promise<Floor>;
  findById(organizationId: string, id: string): Promise<Floor | null>;
  /** The implementation assigns the floor's position (appended after existing floors). */
  create(organizationId: string, buildingId: string, data: FloorFormData): Promise<string>;
  update(organizationId: string, id: string, data: FloorFormData): Promise<void>;
  deactivate(organizationId: string, id: string): Promise<void>;
}

export interface RoomRepository {
  getByFloorId(organizationId: string, floorId: string): Promise<Room[]>;
  getAllActive(organizationId: string): Promise<Room[]>;
  getById(organizationId: string, id: string): Promise<Room>;
  findById(organizationId: string, id: string): Promise<Room | null>;
  create(organizationId: string, buildingId: string, floorId: string, data: RoomFormInput): Promise<string>;
  update(organizationId: string, id: string, data: RoomFormInput): Promise<void>;
  /** Rejects while the room still has active beds. */
  deactivate(organizationId: string, id: string): Promise<void>;
}

export interface BedRepository {
  getByFloorId(organizationId: string, floorId: string): Promise<Bed[]>;
  getByRoomId(organizationId: string, roomId: string): Promise<Bed[]>;
  getAllActive(organizationId: string): Promise<Bed[]>;
  getById(organizationId: string, id: string): Promise<Bed>;
  findById(organizationId: string, id: string): Promise<Bed | null>;
  create(organizationId: string, buildingId: string, floorId: string, roomId: string, data: BedFormInput): Promise<string>;
  /** Rejects a manual change to "occupied". */
  update(organizationId: string, id: string, data: BedUpdateInput): Promise<void>;
  /** Rejects while the bed is occupied. */
  deactivate(organizationId: string, id: string): Promise<void>;
}

export interface OrganizationRepository {
  getById(id: string): Promise<Organization | null>;
  /** Creates the organization with the currently authenticated user as its active owner. */
  create(name: string): Promise<string>;
  update(id: string, name: string): Promise<void>;
  deactivate(id: string): Promise<void>;
}

export interface OrganizationMemberRepository {
  /** Active memberships for a user. Post-migration this becomes "my memberships" resolved from the session. */
  getByUserId(userId: string): Promise<OrganizationMember[]>;
  getMembership(organizationId: string, userId: string): Promise<OrganizationMember | null>;
  create(organizationId: string, userId: string, role: Role, status: MembershipStatus): Promise<void>;
  updateRole(organizationId: string, userId: string, role: Role): Promise<void>;
  updateStatus(organizationId: string, userId: string, status: MembershipStatus): Promise<void>;
}

export type UserProfileUpdate = Partial<Pick<User, "name" | "email" | "phone">>;

export interface UserRepository {
  getById(id: string): Promise<User | null>;
  create(id: string, name: string, email?: string, phone?: string): Promise<void>;
  update(id: string, data: UserProfileUpdate): Promise<void>;
}

/** The full set of repositories the app is composed from. */
export interface Repositories {
  organizations: OrganizationRepository;
  organizationMembers: OrganizationMemberRepository;
  users: UserRepository;
  buildings: BuildingRepository;
  floors: FloorRepository;
  rooms: RoomRepository;
  beds: BedRepository;
}
