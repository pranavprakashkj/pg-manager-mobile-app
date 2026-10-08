// Measures @clerk/backend verifyToken({ jwtKey }) CPU cost in Node and checks a wrong-key token is rejected.
import { readFileSync } from "node:fs";
import { verifyToken } from "@clerk/backend";
import { generateKeyPair, SignJWT } from "jose";

const jwtKey = readFileSync(new URL("../.dev-keys/public.pem", import.meta.url), "utf8");
const token = readFileSync(new URL("../results/local-token.txt", import.meta.url), "utf8").trim();

const { privateKey: otherKey } = await generateKeyPair("RS256");
const now = Math.floor(Date.now() / 1000);
const forged = await new SignJWT({ sid: "sess_x" }).setProtectedHeader({ alg: "RS256", kid: "ins_spike_local" })
  .setIssuer("https://spike-local.clerk.accounts.dev").setSubject("user_attacker").setIssuedAt(now).setNotBefore(now - 5).setExpirationTime(now + 600).sign(otherKey);
try { await verifyToken(forged, { jwtKey }); console.log("wrong-key token: ACCEPTED (BAD)"); }
catch (e) { console.log(`wrong-key token: rejected (${e.reason})`); }

for (let i = 0; i < 50; i++) await verifyToken(token, { jwtKey }); // warm up
const xs = [];
for (let i = 0; i < 500; i++) { const t = performance.now(); await verifyToken(token, { jwtKey }); xs.push(performance.now() - t); }
xs.sort((a, b) => a - b);
console.log(`verifyToken networkless: p50=${xs[249].toFixed(3)}ms p95=${xs[474].toFixed(3)}ms (n=500, Node ${process.version})`);
