import { loadEnvConfig } from "@next/env";
import { sendAdminNotification } from "../lib/email";
import { createBrandedTestEmail } from "../lib/emailTemplates";

loadEnvConfig(process.cwd());

async function main() {
  const email = createBrandedTestEmail({
    fromAlias: process.env.ADMIN_EMAIL_FROM || "PhotoKingShot <admin@photokingshot.com>",
    replyTo: process.env.ADMIN_EMAIL_REPLY_TO || "admin@photokingshot.com",
    websiteUrl: "https://photokingshot.com"
  });

  const result = await sendAdminNotification({
    subject: email.subject,
    text: email.text,
    html: email.html
  });

  if (result.skipped) {
    console.error(`Test email was not sent: ${result.reason || "Email is not configured."}`);
    process.exit(1);
  }

  console.log("Test email sent successfully");
}

main().catch((error) => {
  console.error("Test email failed:", error instanceof Error ? error.message : "Unknown email error");
  process.exit(1);
});
