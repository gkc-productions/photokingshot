import { loadEnvConfig } from "@next/env";
import { sendAdminNotification } from "../lib/email";

loadEnvConfig(process.cwd());

async function main() {
  const result = await sendAdminNotification({
    subject: "PhotoKingShot Email Test",
    text: "This is a test email from the PhotoKingShot website using Gmail SMTP and the verified admin@photokingshot.com alias."
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
