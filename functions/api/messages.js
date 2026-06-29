const MAX_CONTENT_LENGTH = 100;
const MAX_NAME_LENGTH = 12;
const DEFAULT_LIMIT = 50;
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX_MESSAGES = 3;
const DUPLICATE_WINDOW_HOURS = 24;
const OWNER_TOKEN_MIN_LENGTH = 16;
const OWNER_TOKEN_MAX_LENGTH = 128;
let messagesSchemaHasOwnerTokenHash = null;

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

async function hashOwnerToken(token, salt) {
  const normalized = String(token || "").trim();
  if (
    normalized.length < OWNER_TOKEN_MIN_LENGTH ||
    normalized.length > OWNER_TOKEN_MAX_LENGTH ||
    !/^[A-Za-z0-9_-]+$/.test(normalized)
  ) {
    return null;
  }

  const safeSalt = salt || "shanyi-default-owner-salt";
  const bytes = new TextEncoder().encode(`${safeSalt}:${normalized}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hasOwnerTokenHashColumn(env) {
  if (messagesSchemaHasOwnerTokenHash !== null) {
    return messagesSchemaHasOwnerTokenHash;
  }

  try {
    const { results } = await env.DB.prepare(`PRAGMA table_info(messages)`).all();
    messagesSchemaHasOwnerTokenHash = Array.isArray(results) && results.some((column) => column.name === "owner_token_hash");
  } catch {
    messagesSchemaHasOwnerTokenHash = false;
  }

  return messagesSchemaHasOwnerTokenHash;
}

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || DEFAULT_LIMIT, 100);
  const ownerHash = await hashOwnerToken(
    request.headers.get("X-Message-Owner") || url.searchParams.get("owner") || "",
    env.MESSAGE_OWNER_SALT || env.IP_HASH_SALT || ""
  );
  const hasOwnerColumn = await hasOwnerTokenHashColumn(env);

  const selectSql = hasOwnerColumn
    ? `SELECT id, name, content, created_at, owner_token_hash
       FROM messages
       WHERE approved = 1
       ORDER BY created_at DESC, id DESC
       LIMIT ?`
    : `SELECT id, name, content, created_at
       FROM messages
       WHERE approved = 1
       ORDER BY created_at DESC, id DESC
       LIMIT ?`;

  const { results } = await env.DB.prepare(selectSql)
    .bind(limit)
    .all();

  return json({
    messages: (results || []).reverse().map((message) => ({
      id: message.id,
      name: message.name,
      content: message.content,
      created_at: message.created_at,
      owned: Boolean(hasOwnerColumn && ownerHash && message.owner_token_hash && message.owner_token_hash === ownerHash),
    })),
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
  const ownerHash = await hashOwnerToken(
    payload.ownerToken || request.headers.get("X-Message-Owner") || "",
    env.MESSAGE_OWNER_SALT || env.IP_HASH_SALT || ""
  );
  const hasOwnerColumn = await hasOwnerTokenHashColumn(env);

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

  const insertSql = hasOwnerColumn
    ? `INSERT INTO messages (name, content, ip_hash, owner_token_hash, approved, created_at)
       VALUES (?, ?, ?, ?, 1, ?)`
    : `INSERT INTO messages (name, content, ip_hash, approved, created_at)
       VALUES (?, ?, ?, 1, ?)`;

  const result = hasOwnerColumn
    ? await env.DB.prepare(insertSql).bind(name, content, ipHash, ownerHash, now).run()
    : await env.DB.prepare(insertSql).bind(name, content, ipHash, now).run();

  return json(
    {
      message: {
        id: result.meta.last_row_id,
        name,
        content,
        created_at: now,
        owned: Boolean(ownerHash),
      },
    },
    { status: 201 }
  );
}

export async function onRequestDelete(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const id = Number(url.searchParams.get("id"));
  const ownerHash = await hashOwnerToken(
    request.headers.get("X-Message-Owner") || "",
    env.MESSAGE_OWNER_SALT || env.IP_HASH_SALT || ""
  );
  const hasOwnerColumn = await hasOwnerTokenHashColumn(env);

  if (!Number.isInteger(id) || id <= 0) {
    return json({ error: "Message not found" }, { status: 400 });
  }

  if (!ownerHash) {
    return json({ error: "Only your own messages can be deleted" }, { status: 403 });
  }

  if (!hasOwnerColumn) {
    return json({ error: "Delete is unavailable until the database migration is applied" }, { status: 409 });
  }

  const existing = await env.DB.prepare(
    `SELECT id
     FROM messages
     WHERE id = ? AND owner_token_hash = ?
     LIMIT 1`
  )
    .bind(id, ownerHash)
    .first();

  if (!existing) {
    return json({ error: "Only your own messages can be deleted" }, { status: 403 });
  }

  await env.DB.prepare(`DELETE FROM messages WHERE id = ?`).bind(id).run();
  return json({ ok: true, id });
}
