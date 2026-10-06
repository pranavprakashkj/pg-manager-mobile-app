/**
 * set-admin.js — One-time bootstrap script for granting admin access.
 *
 * Run from a trusted local environment (never from the mobile app).
 *
 * Usage:
 *   node scripts/set-admin.js <USER_UID>
 *
 * IMPORTANT — Claim merge strategy:
 *   setCustomUserClaims() REPLACES the entire custom claims object for the user.
 *   If the user already has other custom claims, this script will overwrite them.
 *   For future role/claim additions, first read the existing claims with
 *   admin.auth().getUser(uid), merge the new claims into user.customClaims,
 *   and then call setCustomUserClaims(uid, mergedClaims).
 *   This script intentionally uses a simple replace because it is designed
 *   for the initial single-admin bootstrap only.
 */
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const path = require("path");
const fs = require("fs");

const serviceAccountPath = path.join(__dirname, "..", "serviceAccountKey.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("Error: serviceAccountKey.json not found in the root directory.");
  console.error("Please download it from Firebase Console > Project Settings > Service Accounts.");
  console.error("NEVER commit this file to version control.");
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);
const uid = process.argv[2];

if (!uid) {
  console.error("Error: Please provide the user UID as an argument.");
  console.error("Usage: node scripts/set-admin.js <UID>");
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
});

getAuth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log("Successfully set admin claim for user: " + uid);
    console.log(
      "IMPORTANT: The user must sign out and sign back in on the mobile app for the new claims to take effect."
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error setting custom claims:", error);
    process.exit(1);
  });
