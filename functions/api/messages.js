const MAX_CONTENT_LENGTH = 100;
const MAX_NAME_LENGTH = 12;
const DEFAULT_LIMIT = 50;

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
  if (!ip || !salt) return null;
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
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
