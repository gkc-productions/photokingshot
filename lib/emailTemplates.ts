const brand = {
  name: "PhotoKingShot",
  subtitle: "by GKC Productions",
  email: "admin@photokingshot.com",
  website: "https://photokingshot.com",
  adminBookingsUrl: "https://photokingshot.com/admin/bookings",
  logoUrl: "https://photokingshot.com/brand/photokingshot-logo-full-dark.png",
  dark: "#0f0f0f",
  black: "#050505",
  gold: "#c8a24a",
  goldSoft: "#f6edcf",
  border: "#e8e0cc",
  text: "#191919",
  muted: "#666666",
  background: "#f6f2e8",
  white: "#ffffff"
};

export type BookingEmailData = {
  fullName: string;
  email: string;
  phone: string;
  shootType: string;
  preferredDate?: string;
  location: string;
  message: string;
  createdAt?: Date;
};

type EmailTemplate = {
  subject: string;
  text: string;
  html: string;
};

type SummaryRow = {
  label: string;
  value: string;
  htmlValue?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDateTime(value?: Date) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/New_York"
  }).format(value);
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function telHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
}

function textRows(rows: SummaryRow[]) {
  return rows.map((row) => `${row.label}: ${row.value}`).join("\n");
}

function summaryTable(rows: SummaryRow[]) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin: 0;">
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                <td style="border-bottom: 1px solid ${brand.border}; padding: 14px 0; color: ${brand.muted}; font-size: 13px; font-weight: 700; text-transform: uppercase; width: 38%; vertical-align: top;">${escapeHtml(row.label)}</td>
                <td style="border-bottom: 1px solid ${brand.border}; padding: 14px 0; color: ${brand.text}; font-size: 15px; line-height: 1.55; vertical-align: top;">${row.htmlValue || escapeHtml(row.value)}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function card(content: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; background: ${brand.white}; border: 1px solid ${brand.border}; border-radius: 8px;">
      <tr>
        <td style="padding: 24px;">
          ${content}
        </td>
      </tr>
    </table>
  `;
}

function actionButton(label: string, href: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 24px 0 0;">
      <tr>
        <td style="background: ${brand.black}; border-radius: 4px;">
          <a href="${escapeHtml(href)}" style="display: inline-block; padding: 13px 18px; color: ${brand.white}; font-size: 14px; font-weight: 700; text-decoration: none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>
  `;
}

function baseHtml({
  preview,
  heading,
  intro,
  body
}: {
  preview: string;
  heading: string;
  intro?: string;
  body: string;
}) {
  return `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin: 0; padding: 0; background: ${brand.background}; color: ${brand.text}; font-family: Arial, Helvetica, sans-serif;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">${escapeHtml(preview)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; background: ${brand.background};">
      <tr>
        <td align="center" style="padding: 28px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; max-width: 680px;">
            <tr>
              <td align="center" style="background: ${brand.black}; padding: 18px 28px; border-radius: 8px 8px 0 0;">
                <img src="${brand.logoUrl}" width="260" alt="PhotoKingShot by GKC Productions" style="display: block; max-width: 260px; width: 100%; height: auto; margin: 0 auto;">
              </td>
            </tr>
            <tr>
              <td style="background: ${brand.white}; padding: 30px 28px 12px; border-left: 1px solid ${brand.border}; border-right: 1px solid ${brand.border};">
                <div style="width: 52px; height: 4px; background: ${brand.gold}; margin: 0 0 18px;"></div>
                <h1 style="margin: 0; color: ${brand.dark}; font-size: 28px; line-height: 1.2; font-weight: 800;">${escapeHtml(heading)}</h1>
                ${
                  intro
                    ? `<p style="margin: 14px 0 0; color: ${brand.muted}; font-size: 16px; line-height: 1.6;">${escapeHtml(intro)}</p>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="background: ${brand.white}; padding: 18px 28px 30px; border-left: 1px solid ${brand.border}; border-right: 1px solid ${brand.border};">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="background: ${brand.black}; padding: 22px 28px; border-radius: 0 0 8px 8px;">
                <p style="margin: 0 0 6px; color: ${brand.white}; font-size: 15px; font-weight: 800;">${brand.name} <span style="color: ${brand.gold}; font-weight: 700;">${brand.subtitle}</span></p>
                <p style="margin: 0; color: #d8d8d8; font-size: 13px; line-height: 1.7;">
                  <a href="mailto:${brand.email}" style="color: #d8d8d8; text-decoration: none;">${brand.email}</a>
                  &nbsp;|&nbsp;
                  <a href="${brand.website}" style="color: #d8d8d8; text-decoration: none;">${brand.website}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function createAdminBookingEmail(data: BookingEmailData): EmailTemplate {
  const preferredDate = data.preferredDate || "Flexible / not provided";
  const createdAt = formatDateTime(data.createdAt);
  const phoneHref = telHref(data.phone);
  const rows = [
    { label: "Client name", value: data.fullName },
    {
      label: "Client email",
      value: data.email,
      htmlValue: `<a href="mailto:${escapeHtml(data.email)}" style="color: ${brand.dark}; font-weight: 700; text-decoration: underline;">${escapeHtml(data.email)}</a>`
    },
    {
      label: "Client phone",
      value: data.phone,
      htmlValue: phoneHref
        ? `<a href="${escapeHtml(phoneHref)}" style="color: ${brand.dark}; font-weight: 700; text-decoration: underline;">${escapeHtml(data.phone)}</a>`
        : escapeHtml(data.phone)
    },
    { label: "Shoot type", value: data.shootType },
    { label: "Preferred date", value: preferredDate },
    { label: "Location", value: data.location },
    { label: "Created", value: createdAt }
  ];

  const text = [
    "New PhotoKingShot Booking Inquiry",
    "",
    textRows(rows),
    "",
    "Message:",
    data.message,
    "",
    `View Booking Inquiries: ${brand.adminBookingsUrl}`
  ].join("\n");

  const html = baseHtml({
    preview: `New booking inquiry from ${data.fullName}`,
    heading: "New Booking Inquiry",
    intro: "A new client inquiry was submitted from the PhotoKingShot website.",
    body: `
      ${card(`
        ${summaryTable(rows)}
        <div style="margin-top: 22px; padding: 18px; background: ${brand.goldSoft}; border-left: 4px solid ${brand.gold};">
          <div style="margin: 0 0 8px; color: ${brand.dark}; font-size: 13px; font-weight: 800; text-transform: uppercase;">Message</div>
          <div style="color: ${brand.text}; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(data.message)}</div>
        </div>
        ${actionButton("View Booking Inquiries", brand.adminBookingsUrl)}
      `)}
    `
  });

  return {
    subject: `New PhotoKingShot Booking Inquiry: ${data.fullName}`,
    text,
    html
  };
}

export function createClientBookingConfirmationEmail(data: BookingEmailData): EmailTemplate {
  const preferredDate = data.preferredDate || "Flexible / not provided";
  const rows = [
    { label: "Shoot type", value: data.shootType },
    { label: "Preferred date", value: preferredDate },
    { label: "Location", value: data.location },
    { label: "Message", value: data.message }
  ];

  const text = [
    "Thank you for contacting PhotoKingShot",
    "",
    `Hi ${firstName(data.fullName)},`,
    "",
    "We received your booking inquiry and will follow up soon to confirm availability, details, and next steps.",
    "",
    "Your inquiry summary:",
    textRows(rows),
    "",
    "You can reply directly to this email if you need to add anything.",
    "",
    "PhotoKingShot by GKC Productions",
    brand.email,
    brand.website
  ].join("\n");

  const html = baseHtml({
    preview: "We received your PhotoKingShot booking inquiry.",
    heading: "Thank you for contacting PhotoKingShot",
    intro: `Hi ${firstName(data.fullName)}, we received your booking inquiry and will follow up soon to confirm availability, details, and next steps.`,
    body: `
      ${card(`
        <div style="margin: 0 0 16px; color: ${brand.dark}; font-size: 16px; font-weight: 800;">Your inquiry summary</div>
        ${summaryTable(rows)}
      `)}
      <p style="margin: 22px 0 0; color: ${brand.text}; font-size: 15px; line-height: 1.7;">You can reply directly to this email if you need to add anything.</p>
    `
  });

  return {
    subject: "PhotoKingShot received your booking inquiry",
    text,
    html
  };
}

export function createBrandedTestEmail({
  fromAlias,
  replyTo,
  websiteUrl
}: {
  fromAlias: string;
  replyTo: string;
  websiteUrl: string;
}): EmailTemplate {
  const rows = [
    { label: "From alias", value: fromAlias },
    { label: "Reply-To", value: replyTo },
    { label: "Website URL", value: websiteUrl }
  ];

  return {
    subject: "PhotoKingShot Branded Email Test",
    text: [
      "PhotoKingShot Email Test",
      "",
      "If you are seeing this, branded emails are working.",
      "",
      textRows(rows)
    ].join("\n"),
    html: baseHtml({
      preview: "PhotoKingShot branded email test.",
      heading: "PhotoKingShot Email Test",
      intro: "If you are seeing this, branded emails are working.",
      body: card(summaryTable(rows))
    })
  };
}
