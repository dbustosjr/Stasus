import assert from "node:assert/strict";
import { pickExportFilename } from "../src/lib/export/client-download.ts";

assert.equal(
  pickExportFilename('attachment; filename="stasus-export-2026-07-30.pdf"', "x.pdf"),
  "stasus-export-2026-07-30.pdf",
);
assert.equal(pickExportFilename(null, "fallback.csv"), "fallback.csv");
console.log("export-client-download: ok");
