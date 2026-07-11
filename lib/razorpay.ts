import crypto from "node:crypto";

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

export type RazorpaySubscription = {
  id: string;
  status: string;
  customer_id?: string | null;
  current_start?: number | null;
  current_end?: number | null;
};

export function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const planId = process.env.RAZORPAY_PLAN_ID;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  return { keyId, keySecret, planId, webhookSecret };
}

export function requireRazorpayConfig() {
  const config = getRazorpayConfig();
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing Razorpay environment values: ${missing.join(", ")}`);
  }

  return config as {
    keyId: string;
    keySecret: string;
    planId: string;
    webhookSecret: string;
  };
}

export async function createRazorpaySubscription(input: {
  customerEmail: string;
  customerName: string;
}): Promise<RazorpaySubscription> {
  const { keyId, keySecret, planId } = requireRazorpayConfig();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch(`${RAZORPAY_API_BASE}/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan_id: planId,
      total_count: 1200,
      quantity: 1,
      customer_notify: 1,
      notes: {
        product: "AIFA membership",
        email: input.customerEmail,
        name: input.customerName,
      },
      notify_info: {
        notify_email: input.customerEmail,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Razorpay subscription creation failed: ${detail}`);
  }

  return response.json() as Promise<RazorpaySubscription>;
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}
