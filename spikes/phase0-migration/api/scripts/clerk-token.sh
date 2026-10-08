#!/usr/bin/env bash
# Mints a REAL Clerk session token for a test user via the Clerk Backend API (development instance).
# Usage: CLERK_SECRET_KEY=sk_test_... CLERK_USER_ID=user_... bash scripts/clerk-token.sh
# Prints the JWT. Tokens are short-lived; mint one right before running the benchmark.
# If the create-session endpoint is unavailable on your instance, sign in with the test user in an app
# and log `await getToken()` instead.
set -euo pipefail
: "${CLERK_SECRET_KEY:?set CLERK_SECRET_KEY}"
: "${CLERK_USER_ID:?set CLERK_USER_ID}"
API="https://api.clerk.com/v1"
SESSION_ID=$(curl -sf -X POST "$API/sessions" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" -H "Content-Type: application/json" \
  -d "{\"user_id\":\"$CLERK_USER_ID\"}" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).id))')
curl -sf -X POST "$API/sessions/$SESSION_ID/tokens" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" -H "Content-Type: application/json" \
  -d '{"expires_in_seconds":600}' | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).jwt))'
