import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";

import { verifyRazorpayWebhookSignature } from "../lib/razorpay.ts";

test("verifies valid Razorpay webhook signatures", () => {
  const rawBody = JSON.stringify({
    event: "subscription.activated",
    payload: { subscription: { entity: { id: "sub_test" } } },
  });
  const secret = "test_webhook_secret";
  const signature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  assert.equal(
    verifyRazorpayWebhookSignature(rawBody, signature, secret),
    true,
  );
});

test("rejects invalid Razorpay webhook signatures", () => {
  assert.equal(
    verifyRazorpayWebhookSignature(
      '{"event":"subscription.activated"}',
      "bad-signature",
      "test_webhook_secret",
    ),
    false,
  );
});
