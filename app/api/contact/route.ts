import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const recipientEmail = process.env.CONTACT_EMAIL_TO;

export async function POST(request: NextRequest) {
  if (!recipientEmail) {
    console.error("Recipient email address (CONTACT_EMAIL_TO) is not configured.");
    return NextResponse.json(
      { error: "Internal server error: Email configuration missing." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, phone, cakeInterest, dateNeeded, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields (name, email, message)" },
        { status: 400 }
      );
    }

    // Construct email body
    let emailBody = `
      New Contact Form Submission:
      Name: ${name}
      Email: ${email}
    `;
    if (phone) emailBody += `  Phone: ${phone}\n`;
    if (cakeInterest) emailBody += `  Cake Interest: ${cakeInterest}\n`;
    if (dateNeeded) {
      try {
        const formattedDate = new Date(dateNeeded).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        emailBody += `  Date Needed: ${formattedDate}\n`;
      } catch (formatError) {
        console.error("Error formatting date:", formatError);
        emailBody += `  Date Needed: ${dateNeeded} (Could not format)\n`;
      }
    }
    emailBody += `    Message:
      ${message}
    `;

    const { data, error } = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>", // Required by Resend free tier
      to: [recipientEmail],
      subject: `New Contact from ${name} via Olgish Cakes Website`,
      text: emailBody,
      replyTo: email, // Set reply-to to the sender's email
    });

    if (error) {
      console.error("Resend API Error:", error);
      return NextResponse.json(
        { error: "Failed to send message.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Contact API Error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
