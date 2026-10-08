import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Architecture guard: the domain package must stay portable.
 * Only relative imports and the explicitly allowed packages are permitted.
 */
const SRC = join(__dirname, "..");
const ALLOWED_PACKAGES = new Set(["zod"]);
const FORBIDDEN = /^(react|react-native|expo|@expo|firebase|@firebase|@clerk|hono|drizzle-orm|drizzle-kit|@neondatabase|postgres|pg)(\/|$)/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "__tests__" ? [] : sourceFiles(path);
    return path.endsWith(".ts") ? [path] : [];
  });
}

function importsOf(file: string): string[] {
  const text = readFileSync(file, "utf8");
  const specifiers = [...text.matchAll(/(?:import|export)\s[^'"]*?from\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)|require\(\s*["']([^"']+)["']\s*\)/g)];
  return specifiers.map((m) => m[1] ?? m[2] ?? m[3]);
}

describe("domain package boundaries", () => {
  const files = sourceFiles(SRC);

  it("has source files to check", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it.each(files.map((f) => [relative(SRC, f), f]))("%s imports only portable modules", (_name, file) => {
    for (const spec of importsOf(file)) {
      if (spec.startsWith(".")) continue;
      expect(FORBIDDEN.test(spec), `forbidden import "${spec}"`).toBe(false);
      expect(ALLOWED_PACKAGES.has(spec.split("/")[0]), `unexpected dependency "${spec}"`).toBe(true);
    }
  });

  it("declares only portable runtime dependencies", () => {
    const pkg = JSON.parse(readFileSync(join(SRC, "..", "package.json"), "utf8"));
    expect(Object.keys(pkg.dependencies ?? {})).toEqual(["zod"]);
  });
});
