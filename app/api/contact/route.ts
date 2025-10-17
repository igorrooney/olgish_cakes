import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { serverClient } from "@/sanity/lib/client";
const recipientEmail = process.env.CONTACT_EMAIL_TO || "hello@olgishcakes.co.uk";

export async function POST(request: NextRequest) {
  // Check for required environment variables at runtime
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY environment variable is not set");
    return NextResponse.json(
      { error: "Internal server error: Email service not configured." },
      { status: 500 }
    );
  }

  if (!recipientEmail) {
    console.error("Recipient email address (CONTACT_EMAIL_TO) is not configured.");
    return NextResponse.json(
      { error: "Internal server error: Email configuration missing." },
      { status: 500 }
    );
  }

  // Initialize Resend at runtime
  const resend = new Resend(process.env.RESEND_API_KEY);

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
${formData.get("note") ? `
ADDITIONAL NOTES
────────────────
${formData.get("note")}
` : ""}
${formData.get("giftNote") ? `
GIFT NOTE
─────────
${formData.get("giftNote")}
` : ""}

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

    ${formData.get("note") ? `
    <div class="section">
      <div class="section-title">Additional Notes</div>
      <div class="message">${(formData.get("note") as string).replace(/\n/g, "<br>")}</div>
    </div>
    ` : ""}

    ${formData.get("giftNote") ? `
    <div class="section">
      <div class="section-title">Gift Note</div>
      <div class="message">${(formData.get("giftNote") as string).replace(/\n/g, "<br>")}</div>
    </div>
    ` : ""}

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

    // Only send admin email for non-order inquiries
    // Order inquiries will be handled by the orders API
    let response;
    if (!isOrderInquiry) {
      response = await resend.emails.send({
        from: "Olgish Cakes <hello@olgishcakes.co.uk>",
        to: recipientEmail,
        bcc: "igorrooney@gmail.com",
        replyTo: email,
        subject: `New Contact: ${name}`,
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
    } else {
      // For order inquiries, just create a mock response
      response = { error: null };
    }

    if (response.error) {
      console.error("Resend API Error:", response.error);
      throw new Error(response.error.message);
    }

    // If this is an order form, also create an order in the system
    if (isOrderInquiry) {
      try {
        // Upload design image to Sanity and pass image reference in attachments
        let attachmentImages: any[] = [];
        if (designImage) {

          try {
            // Convert File to Buffer for Sanity upload
            const arrayBuffer = await designImage.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploaded = await serverClient.assets.upload('image', buffer, {
              filename: designImage.name,
              contentType: designImage.type,
            });

            attachmentImages = [
              {
                _type: 'image',
                asset: { _type: 'reference', _ref: uploaded._id },
              },
            ];
          } catch (e: any) {
            console.error('Failed to upload design image to Sanity:', e);
            console.error('Error details:', {
              message: e?.message,
              stack: e?.stack,
              name: e?.name
            });
          }
        } else {

        }
        const orderData = {
          name,
          email,
          phone,
          address,
          city,
          postcode,
          message,
          dateNeeded,
          orderType: formData.get("orderType") as string || "custom-quote",
          productType: formData.get("productType") as string || "custom",
          productId: formData.get("productId") as string || "",
          productName: formData.get("productName") as string || "Custom Order",
          designType: formData.get("designType") as string || "individual",
          quantity: parseInt(formData.get("quantity") as string) || 1,
          unitPrice: parseFloat(formData.get("unitPrice") as string) || 0,
          totalPrice: parseFloat(formData.get("totalPrice") as string) || 0,
          size: formData.get("size") as string || "",
          flavor: formData.get("flavor") as string || "",
          specialInstructions: formData.get("specialInstructions") as string || "",
          deliveryMethod: formData.get("deliveryMethod") as string || "collection",
          deliveryAddress: formData.get("deliveryAddress") as string || "",
          deliveryNotes: formData.get("deliveryNotes") as string || "",
          giftNote: formData.get("giftNote") as string || "",
          note: formData.get("note") as string || "",
          paymentMethod: formData.get("paymentMethod") as string || "cash-collection",
          referrer: formData.get("referrer") as string || "",
          attachments: attachmentImages,
        };

        // Create order via internal API call

        const orderResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        if (orderResponse.ok) {
          const orderResult = await orderResponse.json();

        } else {
          console.error("Failed to create order:", await orderResponse.text());
        }
      } catch (orderError) {
        console.error("Error creating order:", orderError);
        // Don't fail the email if order creation fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
