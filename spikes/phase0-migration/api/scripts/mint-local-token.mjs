// LOCAL-ONLY stand-in for a Clerk session token, used because no Clerk instance is available yet.
// Generates an RS256 key pair, writes the public PEM to .dev.vars as CLERK_JWT_KEY, and mints a
// token with Clerk's session-token claim shape (iss, sub, sid, azp, iat, nbf, exp).
// This exercises the exact @clerk/backend verifyToken({ jwtKey }) path the Worker uses in production;
// it does NOT prove anything about a real Clerk instance.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { generateKeyPair, exportPKCS8, exportSPKI, importPKCS8, SignJWT } from "jose";

const dir = new URL("../.dev-keys/", import.meta.url);
mkdirSync(dir, { recursive: true });
const privPath = new URL("private.pem", dir);
const pubPath = new URL("public.pem", dir);

if (!existsSync(privPath)) {
  const { privateKey, publicKey } = await generateKeyPair("RS256", { extractable: true });
  writeFileSync(privPath, await exportPKCS8(privateKey));
  writeFileSync(pubPath, await exportSPKI(publicKey));
}
const publicPem = readFileSync(pubPath, "utf8").trim();
writeFileSync(
  new URL("../.dev.vars", import.meta.url),
  `CLERK_JWT_KEY="${publicPem.replace(/\n/g, "\\n")}"\n`
);

const sub = process.argv[2] ?? "user_spike_local";
const ttl = +(process.argv[3] ?? 3600);
const expired = process.argv.includes("--expired");
const key = await importPKCS8(readFileSync(privPath, "utf8"), "RS256");
const iat = Math.floor(Date.now() / 1000) - (expired ? 7200 : 0);
const token = await new SignJWT({ sid: "sess_spike_local", azp: "http://localhost:8081", v: 2 })
  .setProtectedHeader({ alg: "RS256", kid: "ins_spike_local", typ: "JWT" })
  .setIssuer("https://spike-local.clerk.accounts.dev")
  .setSubject(sub)
  .setIssuedAt(iat)
  .setNotBefore(iat - 5)
  .setExpirationTime(iat + (expired ? 60 : ttl))
  .sign(key);

process.stdout.write(token);
