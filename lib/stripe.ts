import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeCurrency() {
  return (process.env.STRIPE_CURRENCY || "usd").trim().toLowerCase() || "usd";
}

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return { stripe: null, error: "Stripe is not configured. Add STRIPE_SECRET_KEY before creating payment links." } as const;
  }

  stripeClient ??= new Stripe(secretKey, {
    typescript: true
  });

  return { stripe: stripeClient, error: null } as const;
}

export function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET || "";
}
