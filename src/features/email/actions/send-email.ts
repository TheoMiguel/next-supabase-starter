"use server";

import { resend } from "@/features/email/lib/resend";
import type { ReactElement } from "react";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
}

export async function sendEmail({ to, subject, react, from }: SendEmailOptions) {
  const { error } = await resend.emails.send({
    from: from ?? "Sistema <noreply@boilerplate.com>",
    to,
    subject,
    react,
  });

  if (error) {
    console.error("[sendEmail] Error:", error);
    return { error: error.message };
  }

  return { success: true };
}
