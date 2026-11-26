// Entry program for The Absurd Clause Contest (remake).
// Writes the single-sentence clause to $MAKEFUN_OUTPUT_DIR/entry.txt,
// reads it back to prove the bytes on disk match, and prints the SHA-256.
// Deterministic: no clock, no randomness, Node standard library only.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CLAUSE =
  "Section 7.1: The Company reserves the right to require the User to applaud upon successful login, such applause to be audible, enthusiastic, and not less than three (3) seconds in duration.";

const MAX_CHARS = 200;

function assertClauseShape(text: string): void {
  if (text.length === 0) {
    throw new Error("clause is empty");
  }
  if (text.length > MAX_CHARS) {
    throw new Error(`clause is ${text.length} chars, limit is ${MAX_CHARS}`);
  }
  if (/[\r\n]/.test(text)) {
    throw new Error("clause must fit on one line");
  }
  if (text !== text.trim()) {
    throw new Error("clause must not start or end with whitespace");
  }
  if (!text.endsWith(".")) {
    throw new Error("clause must end with a full stop");
  }
  if (/[^\x20-\x7E]/.test(text)) {
    throw new Error("clause must be printable ASCII");
  }
  const stops = [...text].filter((ch) => ch === ".").length;
  if (stops !== 2) {
    throw new Error(`clause must hold exactly two full stops, found ${stops}`);
  }
  const words = text.split(" ").filter((w) => w.length > 0).length;
  if (words < 10) {
    throw new Error(`clause is too short to read as a clause: ${words} words`);
  }
  if (!text.startsWith("Section 7.1: ")) {
    throw new Error("clause must open with its section number");
  }
}

function emit(text: string): string {
  const dir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
  mkdirSync(dir, { recursive: true });
  const target = join(dir, "entry.txt");
  writeFileSync(target, text, "utf8");
  const onDisk = readFileSync(target, "utf8");
  if (onDisk !== text) {
    throw new Error("bytes on disk differ from the clause");
  }
  return createHash("sha256").update(onDisk, "utf8").digest("hex");
}

assertClauseShape(CLAUSE);
console.log(emit(CLAUSE));
