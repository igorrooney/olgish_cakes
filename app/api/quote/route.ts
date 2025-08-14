﻿import { NextRequest, NextResponse } from "next/server";
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

    // Extract all form fields
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const occasion = formData.get("occasion") as string;
    const dateNeeded = formData.get("dateNeeded") as string;
    const guestCount = formData.get("guestCount") as string;
    const cakeType = formData.get("cakeType") as string;
    const designStyle = formData.get("designStyle") as string;
    const flavors = formData.get("flavors") as string;
    const dietaryRequirements = formData.get("dietaryRequirements") as string;
    const budget = formData.get("budget") as string;
    const specialRequests = formData.get("specialRequests") as string;
    const designImage = formData.get("designImage") as File | null;

    // Validate required fields
    if (!name || !email || !phone || !occasion || !cakeType || !dateNeeded || !budget) {
      return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 });
    }

    // Process file attachment
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

    // Format date
    const formattedDate = dateNeeded
      ? new Date(dateNeeded).toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Not specified";

    // Parse arrays
    const flavorsArray = flavors ? flavors.split(",").filter(Boolean) : [];
    const dietaryArray = dietaryRequirements ? dietaryRequirements.split(",").filter(Boolean) : [];

    // Create email content
    const emailContent = `
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
                         ðŸŽ‚ NEW CUSTOM CAKE QUOTE REQUEST
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

CUSTOMER INFORMATION
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
â€¢ Name: ${name}
â€¢ Email: ${email}
â€¢ Phone: ${phone}

EVENT DETAILS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
â€¢ Occasion: ${occasion}
â€¢ Date Needed: ${formattedDate}
â€¢ Number of Guests: ${guestCount || "Not specified"}

CAKE SPECIFICATIONS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
â€¢ Cake Type: ${cakeType}
â€¢ Design Style: ${designStyle || "Not specified"}
â€¢ Budget Range: ${budget}

FLAVOR PREFERENCES
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
${flavorsArray.length > 0 ? flavorsArray.map(flavor => `â€¢ ${flavor}`).join("\n") : "â€¢ No specific flavors selected"}

DIETARY REQUIREMENTS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
${dietaryArray.length > 0 ? dietaryArray.map(req => `â€¢ ${req}`).join("\n") : "â€¢ No dietary restrictions"}

SPECIAL REQUESTS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
${specialRequests || "No special requests"}

${
  designImage
    ? `
DESIGN REFERENCE
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
â€¢ Image attached: ${designImage.name}
`
    : ""
}

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Best regards,
Olgish Cakes
        olgishcakes.co.uk
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”`.trim();

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
      max-width: 700px;
      margin: 0 auto;
      background-color: #f9f9f9;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #2E3192 0%, #003D7A 100%);
      color: white;
      text-align: center;
      padding: 30px 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 25px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #2E3192;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #2E3192;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-label {
      font-weight: 600;
      color: #555;
      min-width: 120px;
    }
    .info-value {
      color: #333;
    }
    .list-item {
      margin: 8px 0;
      padding-left: 20px;
      position: relative;
    }
    .list-item:before {
      content: "â€¢";
      color: #2E3192;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
    .special-requests {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 6px;
      padding: 15px;
      margin-top: 10px;
    }
    .design-image {
      max-width: 100%;
      margin: 20px 0;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .footer {
      background-color: #f8f9fa;
      text-align: center;
      padding: 20px;
      border-top: 1px solid #e9ecef;
      color: #666;
    }
    .priority-badge {
      background-color: #dc3545;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      display: inline-block;
      margin-left: 10px;
    }
    .budget-highlight {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 6px;
      padding: 10px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ðŸŽ‚ New Custom Cake Quote Request</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional quote inquiry from website</p>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">
          ðŸ‘¤ Customer Information
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Name:</span>
            <span class="info-value">${name}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span>
            <span class="info-value">${email}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Phone:</span>
            <span class="info-value">${phone}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          ðŸ“… Event Details
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Occasion:</span>
            <span class="info-value">${occasion}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Date Needed:</span>
            <span class="info-value">${formattedDate}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Guests:</span>
            <span class="info-value">${guestCount || "Not specified"}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          ðŸŽ‚ Cake Specifications
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Cake Type:</span>
            <span class="info-value">${cakeType}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Design Style:</span>
            <span class="info-value">${designStyle || "Not specified"}</span>
          </div>
        </div>
        
        <div class="budget-highlight">
          <strong>ðŸ’° Budget Range:</strong> ${budget}
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          ðŸ¯ Flavor Preferences
        </div>
        ${
          flavorsArray.length > 0
            ? flavorsArray.map(flavor => `<div class="list-item">${flavor}</div>`).join("")
            : '<div class="list-item">No specific flavors selected</div>'
        }
      </div>

      <div class="section">
        <div class="section-title">
          âš ï¸ Dietary Requirements
        </div>
        ${
          dietaryArray.length > 0
            ? dietaryArray.map(req => `<div class="list-item">${req}</div>`).join("")
            : '<div class="list-item">No dietary restrictions</div>'
        }
      </div>

      ${
        specialRequests
          ? `
      <div class="section">
        <div class="section-title">
          ðŸ’­ Special Requests
        </div>
        <div class="special-requests">
          ${specialRequests.replace(/\n/g, "<br>")}
        </div>
      </div>
      `
          : ""
      }

      ${
        designImage
          ? `
      <div class="section">
        <div class="section-title">
          ðŸ–¼ï¸ Design Reference
        </div>
        <p><strong>Image attached:</strong> ${designImage.name}</p>
        <img src="data:${designImage.type};base64,${base64Image}" alt="Design Reference" class="design-image">
      </div>
      `
          : ""
      }
    </div>

    <div class="footer">
      <strong>Best regards,</strong><br>
      Olgish Cakes<br>
      <a href="https://olgishcakes.co.uk" style="color: #2E3192; text-decoration: none;">olgishcakes.co.uk</a><br>
      <small>Professional Ukrainian Cakes in Leeds</small>
    </div>
  </div>
</body>
</html>`;

    console.log("Sending quote request email to:", recipientEmail);

    const response = await resend.emails.send({
      from: "Olgish Cakes <hello@olgishcakes.co.uk>",
      to: recipientEmail,
      replyTo: email,
      subject: `ðŸŽ‚ Quote Request: ${name} - ${occasion} ${cakeType}`,
      html: htmlContent,
      text: emailContent,
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

    console.log("Quote request email sent successfully:", response);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quote API Error:", error);
    return NextResponse.json({ error: "Failed to send quote request" }, { status: 500 });
  }
}

