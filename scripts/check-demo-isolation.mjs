import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "src/app/demo");
const forbidden = [
  "requireUser",
  "requireOnboarded",
  "createSymptomLog",
  "saveCameraPracticeSession",
  "logExerciseSession",
  "generateWeeklyInsight",
  "ensureMonthlyInsight",
  "ensureOutcomeTrends",
  "startProtocol",
  "endProtocol",
  "recordActivityDay",
  "deleteAccount",
  "createInsForgeAdminClient",
];

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (/\.(ts|tsx|js|jsx)$/.test(name)) files.push(p);
  }
  return files;
}

const files = walk(root);
const hits = [];

for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const needle of forbidden) {
    if (text.includes(needle)) {
      hits.push(`${file}: contains "${needle}"`);
    }
  }
}

if (hits.length) {
  console.error("check-demo-isolation: FAIL");
  for (const h of hits) console.error(" -", h);
  process.exit(1);
}

console.log(`check-demo-isolation: ok (${files.length} files)`);
