CREATE TABLE IF NOT EXISTS subscriptions (
  email TEXT PRIMARY KEY,
  razorpay_customer_id TEXT,
  razorpay_subscription_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_start INTEGER,
  current_end INTEGER,
  last_event_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_razorpay_subscription_id_idx
  ON subscriptions (razorpay_subscription_id);

CREATE INDEX IF NOT EXISTS subscriptions_status_idx
  ON subscriptions (status);

CREATE TABLE IF NOT EXISTS razorpay_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
