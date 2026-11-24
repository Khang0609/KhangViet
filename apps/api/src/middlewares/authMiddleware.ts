import { Context, Next } from "hono";
import { UserRole } from "@khangviet/types";
import { D1DatabaseBinding } from "@khangviet/repositories";
import { getContextRepos } from "../helpers/repoResolver";

export type AuthVariables = {
  authUser: {
    userId: string;
    email: string;
    name: string;
    role: UserRole;
  };
};

export type JwksPayload = {
  keys: Array<JsonWebKey & { kid?: string }>;
};

export type AppEnv = {
  Variables: AuthVariables;
  Bindings?: {
    DB?: D1DatabaseBinding;
    ASSETS?: { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
    ENVIRONMENT?: string;
    NODE_ENV?: string;
    WEB_APP_URL?: string;
    REVALIDATE_SECRET?: string;
    TELEGRAM_BOT_TOKEN?: string;
    TELEGRAM_CHAT_ID?: string | null;
    CF_ACCESS_TEAM_DOMAIN?: string;
    CF_ACCESS_AUD?: string;
    /** Optional JSON-encoded JWKS for offline testing */
    CF_ACCESS_JWKS_JSON?: string;
  };
};

type AccessJwtHeader = {
  alg?: string;
  kid?: string;
};

type AccessJwtPayload = {
  email?: string;
  sub?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
};

const jwksCache = new Map<string, { keys: JwksPayload["keys"]; fetchedAt: number }>();
const JWKS_TTL_MS = 5 * 60 * 1000;

function base64UrlToUint8Array(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(padLen);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function decodeBase64UrlJson<T>(segment: string): T {
  const bytes = base64UrlToUint8Array(segment);
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json) as T;
}

function normalizeTeamOrigin(teamDomain: string): string {
  const trimmed = teamDomain.trim().replace(/\/+$/, "");
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }
  if (trimmed.includes(".")) {
    return `https://${trimmed}`;
  }
  return `https://${trimmed}.cloudflareaccess.com`;
}

async function fetchCloudflareJwks(
  teamOrigin: string,
  overrideJson?: string
): Promise<JwksPayload["keys"]> {
  if (overrideJson) {
    const parsed = JSON.parse(overrideJson) as JwksPayload;
    return parsed.keys ?? [];
  }

  const cached = jwksCache.get(teamOrigin);
  if (cached && Date.now() - cached.fetchedAt < JWKS_TTL_MS) {
    return cached.keys;
  }

  const res = await fetch(`${teamOrigin}/cdn-cgi/access/certs`);
  if (!res.ok) {
    throw new Error(`Failed to fetch Cloudflare Access JWKS: ${res.status}`);
  }
  const data = (await res.json()) as JwksPayload;
  const keys = data.keys ?? [];
  jwksCache.set(teamOrigin, { keys, fetchedAt: Date.now() });
  return keys;
}

export async function verifyCloudflareAccessJwt(
  token: string,
  options: {
    teamDomain: string;
    audience: string;
    jwksJson?: string;
    nowSeconds?: number;
  }
): Promise<{ email: string; sub: string }> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const header = decodeBase64UrlJson<AccessJwtHeader>(headerB64);
  const payload = decodeBase64UrlJson<AccessJwtPayload>(payloadB64);

  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Unsupported JWT algorithm or missing kid");
  }

  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp <= now) {
    throw new Error("JWT expired");
  }

  const teamOrigin = normalizeTeamOrigin(options.teamDomain);
  if (payload.iss !== teamOrigin) {
    throw new Error("Invalid JWT issuer");
  }

  const audValid = Array.isArray(payload.aud)
    ? payload.aud.includes(options.audience)
    : payload.aud === options.audience;
  if (!audValid) {
    throw new Error("Invalid JWT audience");
  }

  if (!payload.email || typeof payload.email !== "string") {
    throw new Error("Missing email claim in JWT");
  }

  const keys = await fetchCloudflareJwks(teamOrigin, options.jwksJson);
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) {
    throw new Error("Matching JWK not found");
  }

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const signingInput = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64UrlToUint8Array(signatureB64);
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    signature as BufferSource,
    signingInput as BufferSource
  );

  if (!valid) {
    throw new Error("Invalid JWT signature");
  }

  return {
    email: payload.email.trim().toLowerCase(),
    sub: payload.sub || payload.email,
  };
}

export const authMiddleware = async (c: Context<AppEnv>, next: Next) => {
  const isProd =
    c.env?.NODE_ENV === "production" || c.env?.ENVIRONMENT === "production";
  const jwt = c.req.header("Cf-Access-Jwt-Assertion");

  let email: string | null = null;

  if (jwt) {
    const teamDomain = c.env?.CF_ACCESS_TEAM_DOMAIN;
    const audience = c.env?.CF_ACCESS_AUD;
    if (!teamDomain || !audience) {
      return c.json(
        {
          success: false as const,
          error: "Server misconfigured: Cloudflare Access env missing",
        },
        500
      );
    }

    try {
      const verified = await verifyCloudflareAccessJwt(jwt, {
        teamDomain,
        audience,
        jwksJson: c.env?.CF_ACCESS_JWKS_JSON,
      });
      email = verified.email;
    } catch {
      return c.json(
        {
          success: false as const,
          error: "Unauthorized: Invalid Cloudflare Access token",
        },
        401
      );
    }
  } else if (isProd) {
    return c.json(
      {
        success: false as const,
        error: "Unauthorized: Missing Cf-Access-Jwt-Assertion",
      },
      401
    );
  } else {
    // Local dev bypass when running outside Cloudflare Access
    const devEmail = c.req.header("X-Dev-User-Email")?.trim().toLowerCase();
    email = devEmail || "admin@khangviet.local";
  }

  // Resolve user from repository when present; fallback for local dev default
  let resolvedUser: AuthVariables["authUser"] | null = null;
  try {
    const userRepo = getContextRepos(c).user as unknown as {
      findByEmail?: (email: string) => Promise<{
        id: string;
        email: string;
        name?: string;
        info?: { name?: string };
        role: string;
        isActive?: boolean;
      } | null>;
    };

    if (userRepo?.findByEmail) {
      const dbUser = await userRepo.findByEmail(email);
      if (dbUser) {
        if (dbUser.isActive === false) {
          return c.json(
            {
              success: false as const,
              error: "Forbidden: Account is disabled",
            },
            403
          );
        }
        const role: UserRole =
          dbUser.role === "ADMIN" || dbUser.role === "STAFF"
            ? dbUser.role
            : "STAFF";
        resolvedUser = {
          userId: dbUser.id,
          email: dbUser.email,
          name: dbUser.name || dbUser.info?.name || dbUser.email,
          role,
        };
      }
    }
  } catch {
    // Ignore repository lookup failure only in local dev default fallback below
  }

  if (!resolvedUser) {
    if (!isProd && !jwt && email === "admin@khangviet.local") {
      resolvedUser = {
        userId: "dev-local-admin",
        email,
        name: "Local Admin",
        role: "ADMIN",
      };
    } else {
      return c.json(
        {
          success: false as const,
          error: "Forbidden: User is not authorized",
        },
        403
      );
    }
  }

  c.set("authUser", resolvedUser);
  return await next();
};

export const requireAdmin = async (c: Context<AppEnv>, next: Next) => {
  const user = c.get("authUser");
  if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
    return c.json(
      {
        success: false as const,
        error: "Forbidden: Requires ADMIN or STAFF privilege",
      },
      403
    );
  }
  return await next();
};
