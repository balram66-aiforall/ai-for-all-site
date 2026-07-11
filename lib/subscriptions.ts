import { env } from "cloudflare:workers";

export type SubscriptionStatus =
  | "created"
  | "authenticated"
  | "active"
  | "charged"
  | "completed"
  | "cancelled"
  | "halted"
  | "pending"
  | "paused"
  | "resumed"
  | "failed";

export type SubscriptionRecord = {
  email: string;
  razorpayCustomerId: string | null;
  razorpaySubscriptionId: string;
  status: SubscriptionStatus;
  currentStart: number | null;
  currentEnd: number | null;
  lastEventId: string | null;
  updatedAt: string;
};

const ACTIVE_STATUSES = new Set<SubscriptionStatus>([
  "authenticated",
  "active",
  "charged",
  "resumed",
]);

export function getDb(): D1Database {
  if (!env.DB) {
    throw new Error("D1 binding DB is unavailable.");
  }
  return env.DB;
}

export async function ensureSubscriptionSchema(db = getDb()) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS subscriptions (
      email TEXT PRIMARY KEY,
      razorpay_customer_id TEXT,
      razorpay_subscription_id TEXT NOT NULL,
      status TEXT NOT NULL,
      current_start INTEGER,
      current_end INTEGER,
      last_event_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(
      "CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_razorpay_subscription_id_idx ON subscriptions (razorpay_subscription_id)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions (status)",
    ),
    db.prepare(`CREATE TABLE IF NOT EXISTS razorpay_webhook_events (
      event_id TEXT PRIMARY KEY,
      event_name TEXT NOT NULL,
      received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
  ]);
}

export async function getSubscriptionByEmail(
  email: string,
): Promise<SubscriptionRecord | null> {
  const db = getDb();
  await ensureSubscriptionSchema(db);
  const row = await db
    .prepare(`SELECT
      email,
      razorpay_customer_id AS razorpayCustomerId,
      razorpay_subscription_id AS razorpaySubscriptionId,
      status,
      current_start AS currentStart,
      current_end AS currentEnd,
      last_event_id AS lastEventId,
      updated_at AS updatedAt
    FROM subscriptions WHERE lower(email) = lower(?)`)
    .bind(email)
    .first<SubscriptionRecord>();

  return row ?? null;
}

export function hasActiveAccess(record: SubscriptionRecord | null): boolean {
  if (!record) return false;
  if (!ACTIVE_STATUSES.has(record.status)) return false;
  if (!record.currentEnd) return true;
  return record.currentEnd * 1000 > Date.now();
}

export async function upsertSubscription(input: {
  email: string;
  razorpayCustomerId?: string | null;
  razorpaySubscriptionId: string;
  status: SubscriptionStatus;
  currentStart?: number | null;
  currentEnd?: number | null;
  lastEventId?: string | null;
}) {
  const db = getDb();
  await ensureSubscriptionSchema(db);
  await db
    .prepare(`INSERT INTO subscriptions (
      email,
      razorpay_customer_id,
      razorpay_subscription_id,
      status,
      current_start,
      current_end,
      last_event_id,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET
      razorpay_customer_id = excluded.razorpay_customer_id,
      razorpay_subscription_id = excluded.razorpay_subscription_id,
      status = excluded.status,
      current_start = excluded.current_start,
      current_end = excluded.current_end,
      last_event_id = excluded.last_event_id,
      updated_at = CURRENT_TIMESTAMP`)
    .bind(
      input.email.toLowerCase(),
      input.razorpayCustomerId ?? null,
      input.razorpaySubscriptionId,
      input.status,
      input.currentStart ?? null,
      input.currentEnd ?? null,
      input.lastEventId ?? null,
    )
    .run();
}

export async function recordWebhookEvent(
  eventId: string,
  eventName: string,
): Promise<boolean> {
  const db = getDb();
  await ensureSubscriptionSchema(db);
  const result = await db
    .prepare(
      "INSERT OR IGNORE INTO razorpay_webhook_events (event_id, event_name) VALUES (?, ?)",
    )
    .bind(eventId, eventName)
    .run();
  return result.meta.changes > 0;
}
