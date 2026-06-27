const MAX_CONTENT_LENGTH = 100;
const MAX_NAME_LENGTH = 12;
const DEFAULT_LIMIT = 50;
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX_MESSAGES = 3;
const DUPLICATE_WINDOW_HOURS = 24;

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers || {}),
    },
  });
}

function sanitizeText(value, maxLength) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

async function hashIp(ip, salt) {
  if (!ip) return null;
  const safeSalt = salt || "shanyi-default-ip-salt";
  const bytes = new TextEncoder().encode(`${safeSalt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || DEFAULT_LIMIT, 100);

  const { results } = await env.DB.prepare(
    `SELECT id, name, content, created_at
     FROM messages
     WHERE approved = 1
     ORDER BY created_at DESC, id DESC
     LIMIT ?`
  )
    .bind(limit)
    .all();

  return json({
    messages: (results || []).reverse(),
  });
}

export async function onRequestPost(context) {
  const { env, request } = context;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "请求格式不正确" }, { status: 400 });
  }

  const name = sanitizeText(payload.name || "26级萌新", MAX_NAME_LENGTH);
  const content = sanitizeText(payload.content, MAX_CONTENT_LENGTH);

  if (!content) {
    return json({ error: "请先写下留言" }, { status: 400 });
  }

  const ip = request.headers.get("CF-Connecting-IP") || "";
  const ipHash = await hashIp(ip, env.IP_HASH_SALT || "");
  const now = new Date().toISOString();

  if (ipHash) {
    const rateLimitSince = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
    const recent = await env.DB.prepare(
      `SELECT COUNT(*) AS count
       FROM messages
       WHERE ip_hash = ? AND created_at >= ?`
    )
      .bind(ipHash, rateLimitSince)
      .first();

    if ((recent?.count || 0) >= RATE_LIMIT_MAX_MESSAGES) {
      return json(
        { error: `留言太热烈啦，请 ${RATE_LIMIT_WINDOW_MINUTES} 分钟后再试` },
        { status: 429 }
      );
    }

    const duplicateSince = new Date(Date.now() - DUPLICATE_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
    const duplicate = await env.DB.prepare(
      `SELECT id
       FROM messages
       WHERE ip_hash = ? AND content = ? AND created_at >= ?
       LIMIT 1`
    )
      .bind(ipHash, content, duplicateSince)
      .first();

    if (duplicate) {
      return json({ error: "这封短笺刚刚已经送达啦" }, { status: 409 });
    }
  }

  const result = await env.DB.prepare(
    `INSERT INTO messages (name, content, ip_hash, approved, created_at)
     VALUES (?, ?, ?, 1, ?)`
  )
    .bind(name, content, ipHash, now)
    .run();

  return json(
    {
      message: {
        id: result.meta.last_row_id,
        name,
        content,
        created_at: now,
      },
    },
    { status: 201 }
  );
}
