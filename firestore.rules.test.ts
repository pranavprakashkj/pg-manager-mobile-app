import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment
} from "@firebase/rules-unit-testing";
import * as fs from "fs";

let testEnv: RulesTestEnvironment;

before(async () => {
  try { process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_EMULATOR_HUB = "127.0.0.1:4400";
testEnv = await initializeTestEnvironment({
    projectId: "pg-manager-rules-test",
    firestore: {
host: "127.0.0.1",
port: 8080,
      rules: fs.readFileSync("firestore.rules", "utf8"),
      
    },
  });
} catch (e) { console.error("INIT ERROR:", e); throw e; }
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

after(async () => {
  if (testEnv) await testEnv.cleanup();
});

// Helpers
const ORG_ID = "org1";
const ORG2_ID = "org2";
const OWNER_UID = "owner1";
const ADMIN_UID = "admin1";
const NO_MEM_UID = "user1";
const ORG2_OWNER = "owner2";

async function setupOrg(db: any, orgId: string, ownerUid: string) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const firestore = context.firestore();
    await firestore.doc(`organizations/${orgId}`).set({ name: "Test Org" });
    await firestore.doc(`organizationMembers/${orgId}_${ownerUid}`).set({
      organizationId: orgId,
      userId: ownerUid,
      role: "owner",
      status: "active"
    });
  });
}

describe("Firestore Security Rules", () => {
  describe("1. AUTHENTICATION", () => {

    it("5a. Authenticated user can discover their own active memberships using the actual application query", async () => {
      await setupOrg(null, ORG_ID, OWNER_UID);
      const db = testEnv.authenticatedContext(OWNER_UID).firestore();
      const query = db.collection("organizationMembers")
        .where("userId", "==", OWNER_UID)
        .where("status", "==", "active");
      await assertSucceeds(query.get());
    });

    it("5b. Unrelated users memberships cannot be enumerated/read via global query", async () => {
      await setupOrg(null, ORG_ID, OWNER_UID);
      const db = testEnv.authenticatedContext("some_hacker").firestore();
      const query = db.collection("organizationMembers");
      await assertFails(query.get());
    });

    it("5c. Unrelated users memberships cannot be read directly", async () => {
      await setupOrg(null, ORG_ID, OWNER_UID);
      const db = testEnv.authenticatedContext("some_hacker").firestore();
      await assertFails(db.doc(`organizationMembers/${ORG_ID}_${OWNER_UID}`).get());
    });

    it("1-5. Unauthenticated user cannot read protected collections", async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(unauthedDb.doc("organizations/org1").get());
      await assertFails(unauthedDb.doc("buildings/b1").get());
      await assertFails(unauthedDb.doc("floors/f1").get());
      await assertFails(unauthedDb.doc("rooms/r1").get());
      await assertFails(unauthedDb.doc("beds/b1").get());
    });
  });

  describe("2. TENANT ISOLATION", () => {
    beforeEach(async () => {
      await setupOrg(null, ORG_ID, OWNER_UID);
      await setupOrg(null, ORG2_ID, ORG2_OWNER);
      
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const firestore = context.firestore();
        await firestore.doc(`organizationMembers/${ORG_ID}_${ADMIN_UID}`).set({
          organizationId: ORG_ID,
          userId: ADMIN_UID,
          role: "admin",
          status: "active"
        });
        await firestore.doc(`buildings/b1`).set({ organizationId: ORG_ID });
        await firestore.doc(`buildings/b2`).set({ organizationId: ORG2_ID });
      });
    });

    it("6. Organization A owner can read Organization A data", async () => {
      const db = testEnv.authenticatedContext(OWNER_UID).firestore();
      await assertSucceeds(db.doc(`organizations/${ORG_ID}`).get());
      await assertSucceeds(db.doc(`buildings/b1`).get());
    });

    it("7. Organization A owner cannot read Organization B data", async () => {
      const db = testEnv.authenticatedContext(OWNER_UID).firestore();
      await assertFails(db.doc(`organizations/${ORG2_ID}`).get());
      await assertFails(db.doc(`buildings/b2`).get());
    });

    it("8. Organization A admin cannot read Organization B data", async () => {
      const db = testEnv.authenticatedContext(ADMIN_UID).firestore();
      await assertFails(db.doc(`organizations/${ORG2_ID}`).get());
      await assertFails(db.doc(`buildings/b2`).get());
    });

    it("9. A user with no membership cannot read organization data", async () => {
      const db = testEnv.authenticatedContext(NO_MEM_UID).firestore();
      await assertFails(db.doc(`organizations/${ORG_ID}`).get());
      await assertFails(db.doc(`buildings/b1`).get());
    });
  });

  describe("3. ROLES", () => {
    beforeEach(async () => {
      await setupOrg(null, ORG_ID, OWNER_UID);
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const firestore = context.firestore();
        await firestore.doc(`organizationMembers/${ORG_ID}_${ADMIN_UID}`).set({
          organizationId: ORG_ID,
          userId: ADMIN_UID,
          role: "admin",
          status: "active"
        });
      });
    });

    it("10. Owner can manage members", async () => {
      const db = testEnv.authenticatedContext(OWNER_UID).firestore();
      await assertSucceeds(db.doc(`organizationMembers/${ORG_ID}_newuser`).set({
        organizationId: ORG_ID,
        userId: "newuser",
        role: "admin",
        status: "active"
      }));
    });

    it("11. Admin cannot manage members", async () => {
      const db = testEnv.authenticatedContext(ADMIN_UID).firestore();
      await assertFails(db.doc(`organizationMembers/${ORG_ID}_newuser`).set({
        organizationId: ORG_ID,
        userId: "newuser",
        role: "admin",
        status: "active"
      }));
    });

    it("12-13. Owner and Admin can manage property data", async () => {
      const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
      const adminDb = testEnv.authenticatedContext(ADMIN_UID).firestore();
      
      await assertSucceeds(ownerDb.doc("buildings/b1").set({ organizationId: ORG_ID }));
      await assertSucceeds(adminDb.doc("buildings/b2").set({ organizationId: ORG_ID }));
    });

    it("14. Admin cannot modify organization-level settings", async () => {
      const adminDb = testEnv.authenticatedContext(ADMIN_UID).firestore();
      await assertFails(adminDb.doc(`organizations/${ORG_ID}`).update({ name: "Hacked" }));
    });
  });

  describe("4. PRIVILEGE ESCALATION", () => {
    beforeEach(async () => {
      await setupOrg(null, ORG_ID, OWNER_UID);
    });

    it("15. User cannot create an owner membership for themselves in an existing organization", async () => {
      const db = testEnv.authenticatedContext(NO_MEM_UID).firestore();
      await assertFails(db.doc(`organizationMembers/${ORG_ID}_${NO_MEM_UID}`).set({
        organizationId: ORG_ID,
        userId: NO_MEM_UID,
        role: "owner",
        status: "active"
      }));
    });

    it("16. User cannot modify another users membership without owner authority", async () => {
      const db = testEnv.authenticatedContext(NO_MEM_UID).firestore();
      await assertFails(db.doc(`organizationMembers/${ORG_ID}_${OWNER_UID}`).update({
        role: "admin"
      }));
    });

    it("17. Membership organizationId cannot be changed", async () => {
      const db = testEnv.authenticatedContext(OWNER_UID).firestore();
      await assertFails(db.doc(`organizationMembers/${ORG_ID}_${OWNER_UID}`).update({
        organizationId: "newOrg"
      }));
    });

    it("18. Property organizationId cannot be changed", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc("buildings/b1").set({ organizationId: ORG_ID });
      });
      const db = testEnv.authenticatedContext(OWNER_UID).firestore();
      await assertFails(db.doc("buildings/b1").update({
        organizationId: "newOrg"
      }));
    });
  });

  describe("5. REFERENTIAL INTEGRITY", () => {
    beforeEach(async () => {
      await setupOrg(null, ORG_ID, OWNER_UID);
      await setupOrg(null, ORG2_ID, ORG2_OWNER);
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const f = context.firestore();
        await f.doc("buildings/b1").set({ organizationId: ORG_ID, isActive: true });
        await f.doc("floors/f1").set({ organizationId: ORG_ID, buildingId: "b1", isActive: true });
        await f.doc("rooms/r1").set({ organizationId: ORG_ID, floorId: "f1", buildingId: "b1", isActive: true });

        await f.doc("buildings/b2").set({ organizationId: ORG2_ID, isActive: true });
      });
    });

    it("19. Cannot create a floor under a building belonging to another organization", async () => {
      const db = testEnv.authenticatedContext(OWNER_UID).firestore();
      await assertFails(db.doc("floors/new").set({
        organizationId: ORG_ID,
        buildingId: "b2" // belongs to ORG2
      }));
    });

    it("20. Cannot create a room under a floor belonging to another organization", async () => {
      const db = testEnv.authenticatedContext(OWNER_UID).firestore();
      await assertFails(db.doc("rooms/new").set({
        organizationId: ORG_ID,
        buildingId: "b1",
        floorId: "fake-floor"
      }));
    });

    it("21. Cannot create a bed under a room belonging to another organization", async () => {
      const db = testEnv.authenticatedContext(OWNER_UID).firestore();
      await assertFails(db.doc("beds/new").set({
        organizationId: ORG_ID,
        buildingId: "b1",
        floorId: "f1",
        roomId: "fake-room"
      }));
    });
  });

  describe("6. LEGACY CLAIM", () => {
    it("22. admin:true custom claim alone does not grant access to an organization without membership", async () => {
      await setupOrg(null, ORG_ID, OWNER_UID);
      const db = testEnv.authenticatedContext("legacy_admin", { admin: true }).firestore();
      await assertFails(db.doc(`organizations/${ORG_ID}`).get());
    });
  });

  describe("7. ORGANIZATION CREATION", () => {

    it("25. Organization creation as a standalone write fails", async () => {
      const db = testEnv.authenticatedContext("new_founder").firestore();
      await assertFails(db.doc("organizations/standaloneOrg").set({ name: "My Org" }));
    });

    it("26. Owner membership creation as a standalone write for a nonexistent organization fails", async () => {
      const db = testEnv.authenticatedContext("new_founder").firestore();
      await assertFails(db.doc("organizationMembers/standaloneOrg_new_founder").set({
        organizationId: "standaloneOrg",
        userId: "new_founder",
        role: "owner",
        status: "active"
      }));
    });

    it("23. Test the legitimate first-organization creation path", async () => {
      const db = testEnv.authenticatedContext("new_founder").firestore();
      const batch = db.batch();
      const orgRef = db.doc("organizations/newOrg123");
      const memRef = db.doc("organizationMembers/newOrg123_new_founder");
      
      batch.set(orgRef, { name: "My Org" });
      batch.set(memRef, {
        organizationId: "newOrg123",
        userId: "new_founder",
        role: "owner",
        status: "active"
      });
      
      await assertSucceeds(batch.commit());
    });

    it("24. Test that an existing organization cannot be hijacked by an arbitrary authenticated user", async () => {
      await setupOrg(null, ORG_ID, OWNER_UID);
      const db = testEnv.authenticatedContext("hacker").firestore();
      const batch = db.batch();
      const orgRef = db.doc(`organizations/${ORG_ID}`);
      const memRef = db.doc(`organizationMembers/${ORG_ID}_hacker`);
      
      batch.set(orgRef, { name: "Hacked" });
      batch.set(memRef, {
        organizationId: ORG_ID,
        userId: "hacker",
        role: "owner",
        status: "active"
      });
      
      await assertFails(batch.commit());
    });
  });
});
