import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { getStripeClient, getStripeCurrency } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectToAdmin(params: Record<string, string>) {
  const url = new URL("/admin/photo-book-requests", process.env.NEXT_PUBLIC_SITE_URL || "https://photokingshot.com");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return NextResponse.redirect(url, { status: 303 });
}

function parseAmountCents(value: FormDataEntryValue | null) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const { id } = await params;
  const formData = await request.formData();
  const amountCents = parseAmountCents(formData.get("amount"));
  const forceNew = formData.get("forceNew") === "true";

  if (!amountCents) return redirectToAdmin({ error: "invalid-amount" });

  const photoBookRequest = await prisma.photoBookRequest.findUnique({ where: { id } }).catch(() => null);
  if (!photoBookRequest) return redirectToAdmin({ error: "not-found" });
  if (photoBookRequest.paymentStatus === "Paid") return redirectToAdmin({ error: "paid" });
  if (!photoBookRequest.clientEmail) return redirectToAdmin({ error: "missing-email" });

  if (!forceNew && photoBookRequest.paymentStatus === "CheckoutCreated" && photoBookRequest.stripeCheckoutSessionId && photoBookRequest.stripeCheckoutUrl) {
    return redirectToAdmin({ checkout: "existing" });
  }

  const { stripe, error } = getStripeClient();
  if (!stripe) {
    return redirectToAdmin({ error: error ? "stripe-not-configured" : "stripe-error" });
  }

  const currency = getStripeCurrency();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://photokingshot.com";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: photoBookRequest.clientEmail,
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: `PhotoKingShot ${photoBookRequest.packageType}`,
            description: `Photo book/album request for ${photoBookRequest.clientName}`
          },
          unit_amount: amountCents
        },
        quantity: 1
      }
    ],
    success_url: `${siteUrl}/photo-book-payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/photo-book-payment/cancel`,
    metadata: {
      photoBookRequestId: photoBookRequest.id,
      clientName: photoBookRequest.clientName,
      packageType: photoBookRequest.packageType,
      ...(photoBookRequest.galleryId ? { galleryId: photoBookRequest.galleryId } : {})
    },
    payment_intent_data: {
      metadata: {
        photoBookRequestId: photoBookRequest.id,
        clientName: photoBookRequest.clientName,
        packageType: photoBookRequest.packageType,
        ...(photoBookRequest.galleryId ? { galleryId: photoBookRequest.galleryId } : {})
      }
    }
  });

  await prisma.photoBookRequest.update({
    where: { id: photoBookRequest.id },
    data: {
      stripeCheckoutSessionId: session.id,
      stripeCheckoutUrl: session.url || null,
      amountCents,
      currency,
      paymentStatus: "CheckoutCreated"
    }
  });

  return redirectToAdmin({ checkout: "created" });
}
