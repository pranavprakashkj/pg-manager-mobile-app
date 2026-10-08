# @pg-manager/domain

Portable domain code shared by `apps/mobile` today and `apps/api` after the migration.

## What belongs here

- Entity types (`entities.ts`) — timestamps are `Date`; no SDK or database types.
- Roles and statuses.
- Zod schemas for user input (`schemas/`).
- Pure business logic (`inventory.ts`, `bedRules.ts`).
- Repository interfaces (`repositories.ts`) — the infrastructure boundary. Every tenant-owned
  operation takes `organizationId` explicitly.
- HTTP API contracts (`contracts/`) — request/response schemas shared by API and mobile.

## What must never be imported here

React, React Native, Expo, Firebase, Clerk, Hono, Drizzle, Neon/Postgres drivers — or anything
else that ties the domain to a runtime or vendor. `src/__tests__/boundaries.test.ts` enforces this,
and `tsconfig.json` type-checks the source with no ambient (Node/RN/DOM) types. The only runtime
dependency is `zod`.

Presentation concerns (labels, colors, currency formatting) stay in `apps/mobile`.

## Not yet in the domain (deliberately)

`Guest`, `Stay`, `DailyCheckInGroup` and `Payment` still exist only as **unfinalized legacy types**
in `apps/mobile/src/types/unfinalized.ts`. They are unused by the app and are kept out of this
package on purpose:

- **Payment — semantic mismatch.** The legacy `Payment` type models a *due / billing-period row*
  (`amountDue`, `amountPaid`, `dueDate`, `billingPeriod`, and a *stored* status that includes
  time-dependent values such as `Overdue` / `Upcoming`). The agreed future meaning is different:
  **a Payment is money actually received and recorded.** The first payment is a real Payment
  record; no placeholder rows are created just because a billing period exists, and overdue state
  is derived, not stored. Recurring schedules/dues are a separate, later concept.
- **Stay — not finalized.** It must store the applicable rent/rate at the time of the stay
  (historical pricing), support monthly and daily stays, deposits, checkout, and non-overlapping
  bed occupancy enforced transactionally on the server. The legacy shape (e.g. no checkout date
  for monthly stays, `isActive` only) is not the target.

These models will be designed with the Guests / Stays / Payments work, after the backend migration.
