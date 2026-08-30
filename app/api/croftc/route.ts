import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";

const BASE_USERS = 1172;

async function ensureSchema() {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS croftc_metrics (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      total_users INTEGER NOT NULL,
      prompts_rewritten INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS croftc_visitors (
      visitor_id TEXT PRIMARY KEY,
      first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await env.DB.prepare(
    `INSERT OR IGNORE INTO croftc_metrics (id, total_users, prompts_rewritten) VALUES (1, ?, 0)`,
  )
    .bind(BASE_USERS)
    .run();
}

async function readMetrics() {
  const result = await env.DB.prepare(
    `SELECT total_users, prompts_rewritten FROM croftc_metrics WHERE id = 1`,
  ).first<{ total_users: number; prompts_rewritten: number }>();

  return {
    totalUsers: result?.total_users ?? BASE_USERS,
    promptsRewritten: result?.prompts_rewritten ?? 0,
  };
}

export async function GET() {
  await ensureSchema();
  return NextResponse.json(await readMetrics());
}

export async function POST(request: Request) {
  await ensureSchema();

  let payload: { action?: string; visitorId?: string } = {};

  try {
    payload = (await request.json()) as { action?: string; visitorId?: string };
  } catch {
    payload = {};
  }

  if (payload.action === "visit" && payload.visitorId) {
    const inserted = await env.DB.prepare(
      `INSERT OR IGNORE INTO croftc_visitors (visitor_id) VALUES (?)`,
    )
      .bind(payload.visitorId)
      .run();

    if ((inserted.meta?.changes ?? 0) > 0) {
      await env.DB.prepare(
        `
          UPDATE croftc_metrics
          SET total_users = total_users + 1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = 1
        `,
      ).run();
    }
  }

  if (payload.action === "rewrite") {
    await env.DB.prepare(
      `
        UPDATE croftc_metrics
        SET prompts_rewritten = prompts_rewritten + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `,
    ).run();
  }

  return NextResponse.json(await readMetrics());
}
