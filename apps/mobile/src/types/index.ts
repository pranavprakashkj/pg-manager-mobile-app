/**
 * App-wide type entry point. Domain types live in @pg-manager/domain (portable,
 * Date-based, no Firebase); this module re-exports them so existing imports keep working.
 *
 * Guest / Stay / Payment are NOT exported — see ./unfinalized.ts.
 */
export type {
  User,
  Organization,
  Role,
  MembershipStatus,
  OrganizationMember,
  Building,
  BuildingFormData,
  Floor,
  FloorFormData,
  Room,
  BedStatus,
  Bed,
  RoomFormInput,
  BedFormInput,
  BedUpdateInput,
} from "@pg-manager/domain";
