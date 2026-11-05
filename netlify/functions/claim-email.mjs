import { getStore } from "@netlify/blobs";
import { claimUniqueEmail } from "../lib/registry.mjs";

const STORE_NAME = "cashzone-email-registry";
const HEALTHCHECK_KEY = "__healthcheck__";
const RESPONSE_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...RESPONSE_HEADERS, ...extraHeaders },
  });
}

function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return origin === new URL(request.url).origin;
  } catch (error) {
    return false;
  }
}

export default async (request) => {
  if (request.method === "GET") {
    try {
      const store = getStore({ name: STORE_NAME, consistency: "strong" });

      // A real read confirms that the Blobs registry is reachable, not just
      // that the function itself responded.
      await store.get(HEALTHCHECK_KEY);
      return json({ ok: true, mode: "global" });
    } catch (error) {
      console.error("Global email registry health check failed.", error);
      return json(
        { ok: false, error: "Global email registry is unavailable." },
        503
      );
    }
  }

  if (request.method !== "POST") {
    return json(
      { ok: false, error: "Method not allowed." },
      405,
      { Allow: "GET, POST" }
    );
  }

  if (!isSameOrigin(request)) {
    return json(
      { ok: false, error: "Cross-origin requests are not allowed." },
      403
    );
  }

  try {
    const store = getStore({ name: STORE_NAME, consistency: "strong" });
    const email = await claimUniqueEmail(store);

    if (!email) {
      return json(
        { ok: false, error: "The unique email registry is temporarily exhausted. Please try again." },
        503
      );
    }

    return json({ ok: true, mode: "global", email });
  } catch (error) {
    console.error("Unable to reserve a globally unique email.", error);
    return json(
      { ok: false, error: "Global email reservation is temporarily unavailable. Please try again." },
      503
    );
  }
};

export const config = {
  path: "/api/claim-email",
  method: ["GET", "POST"],
};
