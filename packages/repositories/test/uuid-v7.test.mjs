import test from "node:test";
import assert from "node:assert/strict";
import { generateUuidV7 } from "../src/d1/uuid-v7.ts";

test("UUIDv7: Format conforms to RFC 9562", () => {
  const id = generateUuidV7();
  assert.equal(typeof id, "string");
  assert.equal(id.length, 36);

  // Check version 7 at position 14 (0-indexed)
  assert.equal(id[14], "7", "UUID version must be 7");

  // Check variant 1 (8, 9, a, or b) at position 19 (0-indexed)
  assert.match(id[19], /[89ab]/, "UUID variant must be 1 (RFC 4122/9562)");

  // Full UUID regex check
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  assert.match(id, uuidRegex, "Must match RFC 9562 UUIDv7 regex format");
});

test("UUIDv7: Monotonic time-ordered sorting", async () => {
  const id1 = generateUuidV7();
  // Small delay to ensure timestamp difference
  await new Promise((resolve) => setTimeout(resolve, 5));
  const id2 = generateUuidV7();
  await new Promise((resolve) => setTimeout(resolve, 5));
  const id3 = generateUuidV7();

  assert.ok(id1 < id2, "id1 should be lexicographically smaller than id2");
  assert.ok(id2 < id3, "id2 should be lexicographically smaller than id3");
});
