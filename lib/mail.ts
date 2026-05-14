import nodemailer from "nodemailer";
import { site } from "@/lib/site";

type BookingNotification = {
  fullName: string;
  email: string;
  phone: string;
  shootType: string;
  preferredDate?: string;
  location: string;
  message: string;
};

function getSmtpConfig() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, ADMIN_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL) {
    return null;
  }

  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port <= 0) {
    return null;
  }

  return {
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    from: SMTP_FROM || `PhotoKingShot <${site.contactEmail}>`,
    to: ADMIN_EMAIL
  };
}

function formatText(data: BookingNotification) {
  return [
    "New PhotoKingShot booking inquiry",
    "",
    `Name: ${data.fullName}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Shoot type: ${data.shootType}`,
    `Preferred date: ${data.preferredDate || "Flexible / not provided"}`,
    `Location: ${data.location}`,
    "",
    "Message:",
    data.message
  ].join("\n");
}

function formatHtml(data: BookingNotification) {
  const rows = [
    ["Name", data.fullName],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Shoot type", data.shootType],
    ["Preferred date", data.preferredDate || "Flexible / not provided"],
    ["Location", data.location]
  ];

  const escape = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  return `
    <div style="font-family: Arial, sans-serif; color: #111;">
      <h1 style="margin: 0 0 16px;">New PhotoKingShot booking inquiry</h1>
      <table style="border-collapse: collapse; width: 100%; max-width: 680px;">
        <tbody>
          ${rows
            .map(
              ([label, value]) => `
                <tr>
                  <th align="left" style="border-bottom: 1px solid #ddd; padding: 10px; width: 150px;">${escape(label)}</th>
                  <td style="border-bottom: 1px solid #ddd; padding: 10px;">${escape(value)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
      <h2 style="margin: 24px 0 8px;">Message</h2>
      <p style="white-space: pre-wrap; line-height: 1.6;">${escape(data.message)}</p>
    </div>
  `;
}

export async function sendBookingNotification(data: BookingNotification) {
  const config = getSmtpConfig();
  if (!config) {
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth
  });

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    replyTo: data.email,
    subject: `New booking inquiry: ${data.fullName}`,
    text: formatText(data),
    html: formatHtml(data)
  });

  return { skipped: false };
}
