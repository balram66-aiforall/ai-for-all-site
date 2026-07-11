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
  subscription_id: string;
  name: string;
  description: string;
  handler: () => void;
  prefill?: {
    email?: string;
    name?: string;
  };
  theme?: {
    color?: string;
  };
};

type CheckoutResponse = {
  keyId: string;
  subscriptionId: string;
  customerEmail: string;
  customerName: string;
};

export function SubscribeButton({ className }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function startCheckout() {
    setStatus("loading");
    try {
      await loadRazorpayScript();
      const response = await fetch("/api/razorpay/create-subscription", {
        method: "POST",
      });

      if (response.status === 401) {
        window.location.href = `/signin-with-chatgpt?return_to=${encodeURIComponent(
          "/",
        )}`;
        return;
      }

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const checkout = (await response.json()) as CheckoutResponse;
      const razorpay = new window.Razorpay!({
        key: checkout.keyId,
        subscription_id: checkout.subscriptionId,
        name: "AIFA",
        description: "AIFA membership - ₹100/month",
        prefill: {
          email: checkout.customerEmail,
          name: checkout.customerName,
        },
        theme: {
          color: "#ff8b2a",
        },
        handler: () => {
          window.location.href = "/members";
        },
      });
      razorpay.open();
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  return (
    <button
      type="button"
      className={className ?? "subscribe-button"}
      onClick={startCheckout}
      disabled={status === "loading"}
    >
      {status === "loading" ? "Opening checkout..." : "Subscribe ₹100/month"}
      {status === "error" ? (
        <span className="subscribe-error"> Payment setup needs attention.</span>
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
