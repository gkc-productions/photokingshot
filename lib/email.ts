import nodemailer from "nodemailer";

type EmailAddress = string | string[];

type SendEmailInput = {
  to?: EmailAddress;
  from?: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  adminTo: string;
  adminFrom: string;
  adminReplyTo?: string;
};

export type EmailResult = {
  skipped: boolean;
  messageId?: string;
  reason?: string;
};

function parseSecure(value: string) {
  return ["1", "true", "yes"].includes(value.trim().toLowerCase());
}

function getEmailConfig(): EmailConfig | null {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    ADMIN_EMAIL_TO,
    ADMIN_EMAIL_FROM,
    ADMIN_EMAIL_REPLY_TO
  } = process.env;

  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_SECURE ||
    !SMTP_USER ||
    !SMTP_PASS ||
    !ADMIN_EMAIL_TO ||
    !ADMIN_EMAIL_FROM
  ) {
    return null;
  }

  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port <= 0) {
    return null;
  }

  return {
    host: SMTP_HOST,
    port,
    secure: parseSecure(SMTP_SECURE),
    user: SMTP_USER,
    pass: SMTP_PASS,
    adminTo: ADMIN_EMAIL_TO,
    adminFrom: ADMIN_EMAIL_FROM,
    adminReplyTo: ADMIN_EMAIL_REPLY_TO || undefined
  };
}

export async function sendEmail(input: SendEmailInput): Promise<EmailResult> {
  const config = getEmailConfig();
  if (!config) {
    return { skipped: true, reason: "Missing or invalid email configuration." };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  const result = await transporter.sendMail({
    from: input.from || config.adminFrom,
    to: input.to || config.adminTo,
    replyTo: input.replyTo || config.adminReplyTo,
    subject: input.subject,
    text: input.text,
    html: input.html
  });

  return { skipped: false, messageId: result.messageId };
}

export async function sendAdminNotification(input: Omit<SendEmailInput, "to">): Promise<EmailResult> {
  const config = getEmailConfig();
  if (!config) {
    return { skipped: true, reason: "Missing or invalid email configuration." };
  }

  return sendEmail({
    ...input,
    to: config.adminTo,
    replyTo: input.replyTo || config.adminReplyTo
  });
}
