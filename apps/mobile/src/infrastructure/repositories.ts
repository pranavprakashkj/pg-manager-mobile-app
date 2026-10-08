import type { Repositories } from "@pg-manager/domain";
import { organizationRepository } from "../features/organizations/organizationRepository";
import { organizationMemberRepository } from "../features/organizations/organizationMemberRepository";
import { userRepository } from "../features/users/userRepository";
import { buildingRepository } from "../features/buildings/buildingRepository";
import { floorRepository } from "../features/floors/floorRepository";
import { roomRepository } from "../features/rooms/roomRepository";
import { bedRepository } from "../features/beds/bedRepository";

/**
 * Composition root for data access — the ONLY place that picks an implementation.
 *
 * Hooks and stores depend on the `Repositories` interface from @pg-manager/domain.
 * Today every implementation is Firebase; the migration swaps these for HTTP
 * repositories that call the API, without touching hooks or screens.
 */
export const repositories: Repositories = {
  organizations: organizationRepository,
  organizationMembers: organizationMemberRepository,
  users: userRepository,
  buildings: buildingRepository,
  floors: floorRepository,
  rooms: roomRepository,
  beds: bedRepository,
};
