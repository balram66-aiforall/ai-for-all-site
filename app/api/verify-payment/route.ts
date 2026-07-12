import {
  requireRazorpayStandardConfig,
  verifyRazorpayPaymentSignature,
} from "../../../lib/razorpay";

type VerifyPaymentPayload = {
  razorpay_order_id?: unknown;
  razorpay_payment_id?: unknown;
  razorpay_signature?: unknown;
};

export async function POST(request: Request) {
  let payload: VerifyPaymentPayload;

  try {
    payload = (await request.json()) as VerifyPaymentPayload;
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const orderId = stringValue(payload.razorpay_order_id);
  const paymentId = stringValue(payload.razorpay_payment_id);
  const signature = stringValue(payload.razorpay_signature);

  if (!orderId || !paymentId || !signature) {
    return Response.json(
      {
        error:
          "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.",
      },
      { status: 400 },
    );
  }

  const { keySecret } = requireRazorpayStandardConfig();
  const verified = verifyRazorpayPaymentSignature({
    orderId,
    paymentId,
    signature,
    keySecret,
  });

  if (!verified) {
    return Response.json(
      { error: "Payment signature verification failed." },
      { status: 400 },
    );
  }

  return Response.json({
    success: true,
    payment_id: paymentId,
    order_id: orderId,
  });
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
