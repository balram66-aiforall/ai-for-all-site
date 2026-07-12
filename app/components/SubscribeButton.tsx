"use client";

import { useState } from "react";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open(): void;
    };
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    email?: string;
    name?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
  };
};

type RazorpayInstance = {
  open(): void;
  on(event: "payment.failed", handler: (response: RazorpayFailureResponse) => void): void;
};

type CreateOrderResponse = {
  order_id: string;
  amount: number;
  currency: string;
};

export function SubscribeButton({ className }: { className?: string }) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "verifying" | "success" | "cancelled" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function startCheckout() {
    setStatus("loading");
    setMessage("");
    try {
      await loadRazorpayScript();
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!keyId) {
        throw new Error("Razorpay public key is not configured.");
      }

      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 10000,
          currency: "INR",
          receipt: `aifa_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const order = (await response.json()) as CreateOrderResponse;
      const razorpay = new window.Razorpay!({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "AIFA",
        description: "AIFA membership - ₹100",
        theme: {
          color: "#ff8b2a",
        },
        modal: {
          ondismiss: () => {
            setStatus("cancelled");
            setMessage("Payment cancelled before completion.");
          },
        },
        handler: async (payment) => {
          try {
            setStatus("verifying");
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payment),
            });

            if (!verifyResponse.ok) {
              throw new Error(await verifyResponse.text());
            }

            setStatus("success");
            setMessage("Payment verified. Thank you for subscribing.");
          } catch (error) {
            console.error(error);
            setStatus("error");
            setMessage(
              error instanceof Error
                ? error.message
                : "Payment verification failed.",
            );
          }
        },
      }) as RazorpayInstance;
      razorpay.on("payment.failed", (failure) => {
        setStatus("error");
        setMessage(
          failure.error?.description ??
            failure.error?.reason ??
            "Payment failed. Please try again.",
        );
      });
      razorpay.open();
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Payment failed.");
    }
  }

  return (
    <button
      type="button"
      className={className ?? "subscribe-button"}
      onClick={startCheckout}
      disabled={status === "loading" || status === "verifying"}
    >
      {status === "loading"
        ? "Opening checkout..."
        : status === "verifying"
          ? "Verifying payment..."
          : "Subscribe ₹100"}
      {message ? (
        <span
          className={
            status === "success" ? "subscribe-message" : "subscribe-error"
          }
        >
          {message}
        </span>
      ) : null}
    </button>
  );
}

function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout."));
    document.body.appendChild(script);
  });
}
