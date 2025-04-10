import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailAttachment {
  filename: string;
  content: File;
}

interface SendEmailProps {
  to: string;
  subject: string;
  text: string;
  attachments?: EmailAttachment[];
}

export async function sendEmail({ to, subject, text, attachments }: SendEmailProps) {
  try {
    const attachmentPromises =
      attachments?.map(async attachment => {
        const buffer = await attachment.content.arrayBuffer();
        return {
          filename: attachment.filename,
          content: Buffer.from(buffer),
        };
      }) || [];

    const resolvedAttachments = await Promise.all(attachmentPromises);

    const response = await resend.emails.send({
      from: process.env.NEXT_PUBLIC_EMAIL_FROM || "onboarding@resend.dev",
      to,
      subject,
      text,
      attachments: resolvedAttachments,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
