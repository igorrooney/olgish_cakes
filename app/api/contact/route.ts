import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);
const recipientEmail = process.env.CONTACT_EMAIL_TO || "hello@olgishcakes.co.uk";

export async function POST(request: NextRequest) {
  if (!recipientEmail) {
    console.error("Recipient email address (CONTACT_EMAIL_TO) is not configured.");
    return NextResponse.json(
      { error: "Internal server error: Email configuration missing." },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const address = formData.get("address") as string | null;
    const city = formData.get("city") as string | null;
    const postcode = formData.get("postcode") as string | null;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const message = formData.get("message") as string;
    const dateNeeded = formData.get("dateNeeded") as string;
    const dateNeededDisplay = formData.get("dateNeededDisplay") as string;
    const designImage = formData.get("designImage") as File | null;
    const cakeInterest = formData.get("cakeInterest") as string;
    const isOrderForm = formData.get("isOrderForm") === "true";

    const isMessageRequired = !(formData.get("isOrderForm") === "true");
    if (!name || !email || (isMessageRequired && !message)) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    let attachments = [];
    let base64Image = "";
    let imageBuffer: ArrayBuffer | null = null;

    if (designImage) {
      imageBuffer = await designImage.arrayBuffer();
      base64Image = Buffer.from(imageBuffer).toString("base64");
      attachments.push({
        filename: designImage.name,
        content: Buffer.from(imageBuffer),
      });
    }

    // More precise detection of order inquiries
    const isOrderInquiry =
      isOrderForm || (message.includes("Cake:") && message.includes("Design Type:"));

    const formattedDate =
      dateNeededDisplay ||
      (dateNeeded
        ? new Date(dateNeeded).toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : null);

    const emailContent = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         ${isOrderInquiry ? "🎂 NEW CAKE ORDER INQUIRY" : "📨 NEW CONTACT MESSAGE"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CUSTOMER INFORMATION
──────────────────
• Name: ${name}
${address ? `• Address: ${address}` : ""}
• Email: ${email}
• Phone: ${phone}
${city ? `• City: ${city}` : ""}
${postcode ? `• Postcode: ${postcode}` : ""}
${formattedDate ? `• Required Date: ${formattedDate}` : ""}
${cakeInterest ? `• Cake Interest: ${cakeInterest}` : ""}

MESSAGE DETAILS
─────────────
${message}

${
  designImage
    ? `
ATTACHMENTS
───────────
• Design Reference Image: ${designImage.name}
`
    : ""
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Best regards,
Olgish Cakes
        olgishcakes.co.uk
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      padding: 20px;
      background-color: #f9f9f9;
      border-bottom: 2px solid #eee;
    }
    .content {
      padding: 20px;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #2c5282;
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }
    .info-item {
      margin: 8px 0;
    }
    .message {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      white-space: pre-wrap;
    }
    .design-image {
      max-width: 100%;
      margin: 20px 0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .footer {
      text-align: center;
      padding: 20px;
      background-color: #f9f9f9;
      border-top: 2px solid #eee;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="color: #2c5282; margin: 0;">
      ${isOrderInquiry ? "🎂 New Cake Order Inquiry" : "📨 New Contact Message"}
    </h1>
  </div>
  
  <div class="content">
    <div class="section">
      <div class="section-title">Customer Information</div>
      <div class="info-item">• Name: ${name}</div>
      ${address ? `<div class="info-item">• Address: ${address}</div>` : ""}
      ${city ? `<div class="info-item">• City: ${city}</div>` : ""}
      <div class="info-item">• Email: ${email}</div>
      <div class="info-item">• Phone: ${phone}</div>
      ${postcode ? `<div class="info-item">• Postcode: ${postcode}</div>` : ""}
      ${formattedDate ? `<div class="info-item">• Required Date: ${formattedDate}</div>` : ""}
      ${cakeInterest ? `<div class="info-item">• Cake Interest: ${cakeInterest}</div>` : ""}
    </div>

    <div class="section">
      <div class="section-title">Message Details</div>
      <div class="message">${message.replace(/\n/g, "<br>")}</div>
    </div>

    ${
      designImage
        ? `
    <div class="section">
      <div class="section-title">Design Reference</div>
      <img src="data:${designImage.type};base64,${base64Image}" alt="Design Reference" class="design-image">
    </div>
    `
        : ""
    }
  </div>

  <div class="footer">
    <strong>Best regards,</strong><br>
    Olgish Cakes<br>
            <a href="https://olgishcakes.co.uk" style="color: #2c5282; text-decoration: none;">olgishcakes.co.uk</a>
  </div>
</body>
</html>`;

    console.log("Sending email to:", recipientEmail);

    const response = await resend.emails.send({
      from: "Olgish Cakes <hello@olgishcakes.co.uk>",
      to: recipientEmail,
      replyTo: email,
      subject: isOrderInquiry ? `New Order Inquiry` : `New Contact: ${name}`,
      html: htmlContent,
      text: emailContent, // Fallback plain text version
      attachments: designImage
        ? [
            {
              filename: designImage.name,
              content: Buffer.from(imageBuffer!),
            },
          ]
        : [],
    });

    if (response.error) {
      console.error("Resend API Error:", response.error);
      throw new Error(response.error.message);
    }

    console.log("Email sent successfully:", response);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
