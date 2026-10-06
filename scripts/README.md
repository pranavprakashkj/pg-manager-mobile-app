# Admin Setup Scripts

This directory contains utility scripts for administrative tasks that should only be run from a trusted, secure local environment.

## Granting Admin Access

The PG Manager Mobile App relies on a Firebase Custom Claim (`admin: true`) to authorize access to the Firestore database. Follow these steps to promote your first user to an admin.

### 1. Prerequisites
1. Create a user via the Firebase Console -> Authentication.
2. Copy that user\u0027s **User UID**.
3. Go to Firebase Console -> Project Settings -> Service Accounts.
4. Click **Generate new private key**.
5. Save the downloaded JSON file as `serviceAccountKey.json` in the **root** of this project.
   - *Note: This file is heavily privileged. It has been added to `.gitignore`. **NEVER commit it.***

### 2. Run the Script
From the project root, run:
\`\`\`bash
node scripts/set-admin.js <COPIED_USER_UID>
\`\`\`

### 3. Claim Refresh
Firebase ID tokens are minted and cached. For the new `admin` claim to become active on the mobile device, the user **MUST** log out and log back in, which forces a token refresh.
