import { getChatGPTUser } from "../../../chatgpt-auth";
import { createRazorpaySubscription, requireRazorpayConfig } from "../../../../lib/razorpay";
import { upsertSubscription } from "../../../../lib/subscriptions";

export async function POST() {
  const user = await getChatGPTUser();
  if (!user) {
    return Response.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const config = requireRazorpayConfig();
    const subscription = await createRazorpaySubscription({
      customerEmail: user.email,
      customerName: user.displayName,
    });

    await upsertSubscription({
      email: user.email,
      razorpayCustomerId: subscription.customer_id ?? null,
      razorpaySubscriptionId: subscription.id,
      status: "created",
      currentStart: subscription.current_start ?? null,
      currentEnd: subscription.current_end ?? null,
    });

    return Response.json({
      keyId: config.keyId,
      subscriptionId: subscription.id,
      customerEmail: user.email,
      customerName: user.displayName,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start checkout.";
    return Response.json({ error: message }, { status: 500 });
  }
}
