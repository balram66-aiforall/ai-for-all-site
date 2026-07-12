import { createRazorpayOrder } from "../../../lib/razorpay";

const MINIMUM_AMOUNT_PAISE = 100;
const DEFAULT_AMOUNT_PAISE = 10000;
const DEFAULT_CURRENCY = "INR";

export async function POST(request: Request) {
  let payload: { amount?: unknown; currency?: unknown; receipt?: unknown } = {};

  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    payload = {};
  }

  const amount =
    typeof payload.amount === "number" ? payload.amount : DEFAULT_AMOUNT_PAISE;
  const currency =
    typeof payload.currency === "string" && payload.currency.trim()
      ? payload.currency.trim().toUpperCase()
      : DEFAULT_CURRENCY;
  const receipt =
    typeof payload.receipt === "string" && payload.receipt.trim()
      ? payload.receipt.trim()
      : `aifa_${Date.now()}`;

  if (!Number.isInteger(amount) || amount < MINIMUM_AMOUNT_PAISE) {
    return Response.json(
      { error: "Amount must be an integer of at least 100 paise." },
      { status: 400 },
    );
  }

  try {
    const order = await createRazorpayOrder({ amount, currency, receipt });
    return Response.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create Razorpay order.";
    const status = /auth|key|unauthorized/i.test(message) ? 401 : 500;
    return Response.json({ error: message }, { status });
  }
}
