import test from "node:test";
import assert from "node:assert/strict";
import { Hono } from "hono";
import {
  authMiddleware,
  verifyCloudflareAccessJwt,
  type AppEnv,
} from "./authMiddleware";

function toBase64Url(input: Uint8Array | string): string {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createTestRsaKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );
  const publicJwk = (await crypto.subtle.exportKey(
    "jwk",
    keyPair.publicKey
  )) as JsonWebKey & { kid?: string };
  publicJwk.kid = "test-kid-1";
  return {
    privateKey: keyPair.privateKey,
    jwksJson: JSON.stringify({ keys: [publicJwk] }),
  };
}

async function signJwt(
  privateKey: CryptoKey,
  payload: Record<string, unknown>,
  kid = "test-kid-1"
): Promise<string> {
  const header = toBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT", kid }));
  const body = toBase64Url(JSON.stringify(payload));
  const signingInput = new TextEncoder().encode(`${header}.${body}`);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    signingInput
  );
  return `${header}.${body}.${toBase64Url(new Uint8Array(signature))}`;
}

test("verifyCloudflareAccessJwt verifies valid RS256 token", async () => {
  const { privateKey, jwksJson } = await createTestRsaKeyPair();
  const now = Math.floor(Date.now() / 1000);
  const token = await signJwt(privateKey, {
    email: "Admin@KhangViet.vn ",
    sub: "user-1",
    iss: "https://khangviet.cloudflareaccess.com",
    aud: ["aud-123"],
    exp: now + 300,
  });

  const result = await verifyCloudflareAccessJwt(token, {
    teamDomain: "khangviet",
    audience: "aud-123",
    jwksJson,
    nowSeconds: now,
  });

  assert.equal(result.email, "admin@khangviet.vn");
  assert.equal(result.sub, "user-1");
});

test("verifyCloudflareAccessJwt rejects expired token", async () => {
  const { privateKey, jwksJson } = await createTestRsaKeyPair();
  const now = Math.floor(Date.now() / 1000);
  const token = await signJwt(privateKey, {
    email: "admin@khangviet.vn",
    iss: "https://khangviet.cloudflareaccess.com",
    aud: "aud-123",
    exp: now - 10,
  });

  await assert.rejects(
    () =>
      verifyCloudflareAccessJwt(token, {
        teamDomain: "khangviet",
        audience: "aud-123",
        jwksJson,
        nowSeconds: now,
      }),
    /expired/i
  );
});

test("authMiddleware returns 401 in production when Cf-Access-Jwt-Assertion is missing", async () => {
  const app = new Hono<AppEnv>();
  app.use("/api/protected", authMiddleware);
  app.get("/api/protected", (c) => c.json({ ok: true }));

  const res = await app.request(
    "/api/protected",
    { method: "GET" },
    {
      ENVIRONMENT: "production",
      CF_ACCESS_TEAM_DOMAIN: "khangviet",
      CF_ACCESS_AUD: "aud-123",
    }
  );

  assert.equal(res.status, 401);
});

test("authMiddleware returns 401 in production when JWT signature is tampered", async () => {
  const { privateKey, jwksJson } = await createTestRsaKeyPair();
  const now = Math.floor(Date.now() / 1000);
  const token = await signJwt(privateKey, {
    email: "admin@khangviet.vn",
    iss: "https://khangviet.cloudflareaccess.com",
    aud: "aud-123",
    exp: now + 300,
  });
  const tampered = `${token.slice(0, -4)}AAAA`;

  const app = new Hono<AppEnv>();
  app.use("/api/protected", authMiddleware);
  app.get("/api/protected", (c) => c.json({ ok: true }));

  const res = await app.request(
    "/api/protected",
    {
      method: "GET",
      headers: { "Cf-Access-Jwt-Assertion": tampered },
    },
    {
      ENVIRONMENT: "production",
      CF_ACCESS_TEAM_DOMAIN: "khangviet",
      CF_ACCESS_AUD: "aud-123",
      CF_ACCESS_JWKS_JSON: jwksJson,
    }
  );

  assert.equal(res.status, 401);
});

test("authMiddleware returns 403 in production when valid JWT email is not in users repo", async () => {
  const { privateKey, jwksJson } = await createTestRsaKeyPair();
  const now = Math.floor(Date.now() / 1000);
  const token = await signJwt(privateKey, {
    email: "stranger@gmail.com",
    iss: "https://khangviet.cloudflareaccess.com",
    aud: "aud-123",
    exp: now + 300,
  });

  const app = new Hono<AppEnv>();
  app.use("/api/protected", authMiddleware);
  app.get("/api/protected", (c) => c.json({ ok: true }));

  const res = await app.request(
    "/api/protected",
    {
      method: "GET",
      headers: { "Cf-Access-Jwt-Assertion": token },
    },
    {
      ENVIRONMENT: "production",
      CF_ACCESS_TEAM_DOMAIN: "khangviet",
      CF_ACCESS_AUD: "aud-123",
      CF_ACCESS_JWKS_JSON: jwksJson,
    }
  );

  assert.equal(res.status, 403);
});

test("authMiddleware allows local dev bypass without JWT", async () => {
  const app = new Hono<AppEnv>();
  app.use("/api/protected", authMiddleware);
  app.get("/api/protected", (c) => c.json({ user: c.get("authUser") }));

  const res = await app.request("/api/protected", { method: "GET" }, {});
  assert.equal(res.status, 200);
  const body = (await res.json()) as { user: { email: string; role: string } };
  assert.equal(body.user.email, "admin@khangviet.local");
  assert.equal(body.user.role, "ADMIN");
});
