import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "../server/lib/auth.mjs";
import { escapeHtml } from "../client/src/utils.js";

test("password hashing uses salts and verifies without storing plaintext", () => {
  const first = hashPassword("secure-password");
  const second = hashPassword("secure-password");
  assert.notEqual(first.salt, second.salt);
  assert.notEqual(first.hash, second.hash);
  assert.equal(verifyPassword("secure-password", first.salt, first.hash), true);
  assert.equal(verifyPassword("wrong-password", first.salt, first.hash), false);
  assert.equal(first.hash.includes("secure-password"), false);
});

test("frontend HTML escaping neutralises executable markup", () => {
  assert.equal(
    escapeHtml('<img src=x onerror="alert(1)">'),
    "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
  );
});
