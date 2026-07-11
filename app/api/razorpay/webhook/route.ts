import { requireRazorpayConfig, verifyRazorpayWebhookSignature } from "../../../../lib/razorpay";
import {
  recordWebhookEvent,
  SubscriptionStatus,
  upsertSubscription,
} from "../../../../lib/subscriptions";

type RazorpayWebhookPayload = {
  event: string;
  payload?: {
    subscription?: {
      entity?: {
        id: string;
        status?: string;
        customer_id?: string | null;
        current_start?: number | null;
        current_end?: number | null;
        notes?: {
          email?: string;
        };
      };
    };
    payment?: {
      entity?: {
        id: string;
        email?: string;
      };
    };
  };
  created_at?: number;
};

const EVENT_STATUS: Record<string, SubscriptionStatus> = {
  "subscription.authenticated": "authenticated",
  "subscription.activated": "active",
  "subscription.charged": "charged",
  "subscription.completed": "completed",
  "subscription.cancelled": "cancelled",
  "subscription.halted": "halted",
  "subscription.pending": "pending",
  "subscription.paused": "paused",
  "subscription.resumed": "resumed",
};

export async function POST(request: Request) {
  const { webhookSecret } = requireRazorpayConfig();
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret)) {
    return Response.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
  const subscription = payload.payload?.subscription?.entity;
  const eventId =
    request.headers.get("x-razorpay-event-id") ??
    `${payload.event}:${subscription?.id ?? "none"}:${payload.created_at ?? Date.now()}`;

  const isNewEvent = await recordWebhookEvent(eventId, payload.event);
  if (!isNewEvent) {
    return Response.json({ ok: true, duplicate: true });
  }

  if (!subscription) {
    return Response.json({ ok: true, ignored: true });
  }

  const email =
    subscription.notes?.email ?? payload.payload?.payment?.entity?.email ?? null;
  const status = EVENT_STATUS[payload.event] ?? normalizeStatus(subscription.status);

  if (!email || !status) {
    return Response.json({ ok: true, ignored: true });
  }

  await upsertSubscription({
    email,
    razorpayCustomerId: subscription.customer_id ?? null,
    razorpaySubscriptionId: subscription.id,
    status,
    currentStart: subscription.current_start ?? null,
    currentEnd: subscription.current_end ?? null,
    lastEventId: eventId,
  });

  return Response.json({ ok: true });
}

function normalizeStatus(value: string | undefined): SubscriptionStatus | null {
  if (!value) return null;
  if (value === "active") return "active";
  if (value === "authenticated") return "authenticated";
  if (value === "created") return "created";
  if (value === "cancelled") return "cancelled";
  if (value === "halted") return "halted";
  if (value === "pending") return "pending";
  if (value === "completed") return "completed";
  if (value === "paused") return "paused";
  return "failed";
}
