-- DISPOSABLE spike schema (isolated in its own `spike_phase0` schema).
-- NOT the production schema — just enough shape to validate tenancy checks and
-- an Organization → Building → Floor → Room → Bed batched read.
DROP SCHEMA IF EXISTS spike_phase0 CASCADE;
CREATE SCHEMA spike_phase0;
SET search_path = spike_phase0;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL UNIQUE,      -- identity lives in Clerk; this is only the link
  name text NOT NULL
);

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL
);

CREATE TABLE organization_members (        -- business membership: ours, not Clerk Organizations
  organization_id uuid NOT NULL REFERENCES organizations(id),
  user_id uuid NOT NULL REFERENCES users(id),
  role text NOT NULL CHECK (role IN ('owner','admin')),
  status text NOT NULL CHECK (status IN ('active','invited','inactive')),
  PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE buildings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL, is_active boolean NOT NULL DEFAULT true,
  UNIQUE (organization_id, id)
);
CREATE TABLE floors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL, building_id uuid NOT NULL,
  name text NOT NULL, sort_order int NOT NULL, is_active boolean NOT NULL DEFAULT true,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, building_id) REFERENCES buildings (organization_id, id)
);
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL, floor_id uuid NOT NULL,
  room_number text NOT NULL, is_active boolean NOT NULL DEFAULT true,
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, floor_id) REFERENCES floors (organization_id, id)
);
CREATE TABLE beds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL, room_id uuid NOT NULL,
  name text NOT NULL,
  status text NOT NULL CHECK (status IN ('vacant','occupied','reserved','maintenance')),
  default_monthly_rate_paise bigint NOT NULL CHECK (default_monthly_rate_paise >= 0),
  is_active boolean NOT NULL DEFAULT true,
  FOREIGN KEY (organization_id, room_id) REFERENCES rooms (organization_id, id)
);

CREATE INDEX ON floors (organization_id, building_id) WHERE is_active;
CREATE INDEX ON rooms (organization_id, floor_id) WHERE is_active;
CREATE INDEX ON beds (organization_id, room_id) WHERE is_active;
