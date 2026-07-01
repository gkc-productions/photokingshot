import Stripe from "stripe";
import { NextResponse } from "next/server";
import { sendAdminNotification, sendEmail } from "@/lib/email";
import { createAdminPhotoBookPaymentReceivedEmail, createClientPhotoBookPaymentConfirmationEmail } from "@/lib/emailTemplates";
import { prisma } from "@/lib/prisma";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function sendPaymentEmails(request: {
  clientName: string;
  clientEmail: string;
  packageType: string;
  amountCents: number | null;
  currency: string;
  paidAt: Date | null;
}) {
  const adminEmail = createAdminPhotoBookPaymentReceivedEmail(request);
  const clientEmail = createClientPhotoBookPaymentConfirmationEmail(request);

  const adminResult = await sendAdminNotification({
    subject: adminEmail.subject,
    text: adminEmail.text,
    html: adminEmail.html,
    replyTo: request.clientEmail
  });

  if (adminResult.skipped) {
    console.warn(`Photo book payment admin email skipped: ${adminResult.reason || "Email is not configured."}`);
  }

  const clientResult = await sendEmail({
    to: request.clientEmail,
    subject: clientEmail.subject,
    text: clientEmail.text,
    html: clientEmail.html
  });

  if (clientResult.skipped) {
    console.warn(`Photo book payment client email skipped: ${clientResult.reason || "Email is not configured."}`);
  }
}

async function findRequestForSession(session: Stripe.Checkout.Session) {
  const photoBookRequestId = session.metadata?.photoBookRequestId;
  if (photoBookRequestId) {
    const request = await prisma.photoBookRequest.findUnique({ where: { id: photoBookRequestId } });
    if (request) return request;
  }

  return prisma.photoBookRequest.findFirst({ where: { stripeCheckoutSessionId: session.id } });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const request = await findRequestForSession(session);
  if (!request) return;

  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null;
  const paidAt = new Date();
  const updated = await prisma.photoBookRequest.update({
    where: { id: request.id },
    data: {
      paymentStatus: "Paid",
      paidAt,
      stripePaymentIntentId: paymentIntentId,
      stripeCheckoutSessionId: session.id,
      amountCents: typeof session.amount_total === "number" ? session.amount_total : request.amountCents,
      currency: session.currency || request.currency
    }
  });

  await sendPaymentEmails(updated).catch((error) => {
    console.warn("Photo book payment was recorded, but notification email failed.", error instanceof Error ? error.message : "Unknown email error");
  });
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const request = await findRequestForSession(session);
  if (!request || request.paymentStatus === "Paid") return;

  await prisma.photoBookRequest.update({
    where: { id: request.id },
    data: { paymentStatus: "Expired" }
  });
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const photoBookRequestId = paymentIntent.metadata?.photoBookRequestId;
  const request = photoBookRequestId
    ? await prisma.photoBookRequest.findUnique({ where: { id: photoBookRequestId } })
    : await prisma.photoBookRequest.findFirst({ where: { stripePaymentIntentId: paymentIntent.id } });

  if (!request || request.paymentStatus === "Paid") return;

  await prisma.photoBookRequest.update({
    where: { id: request.id },
    data: {
      paymentStatus: "Failed",
      stripePaymentIntentId: paymentIntent.id
    }
  });
}

export async function POST(request: Request) {
  const { stripe } = getStripeClient();
  const webhookSecret = getStripeWebhookSecret();
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 400 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "checkout.session.expired":
      await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
