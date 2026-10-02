interface MailgunConfig {
  apiKey: string;
  domain: string;
  fromEmail: string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

function getConfig(): MailgunConfig {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const fromEmail = process.env.MAILGUN_FROM_EMAIL;

  if (!apiKey || !domain || !fromEmail) {
    throw new Error("Missing Mailgun configuration. Check environment variables.");
  }

  return { apiKey, domain, fromEmail };
}

export async function sendOrderConfirmationEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    const config = getConfig();

    const formData = new FormData();
    formData.append("from", config.fromEmail);
    formData.append("to", params.to);
    formData.append("subject", params.subject);
    formData.append("html", params.html);
    if (params.text) {
      formData.append("text", params.text);
    }

    const response = await fetch(`https://api.mailgun.net/v3/${config.domain}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${config.apiKey}`).toString("base64")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Mailgun API error: ${response.status}`;
      return { success: false, error: errorMessage };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error sending email";
    return { success: false, error: message };
  }
}

export function buildOrderConfirmationEmail(order: {
  id: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  city: string;
  state: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  created_at: string;
  items: Array<{
    products: { name: string };
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
}): { subject: string; html: string; text: string } {
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const orderIdShort = order.id.slice(0, 8).toUpperCase();

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e4e4e7;">${item.products.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e4e4e7; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e4e4e7; text-align: right;">${formatPrice(item.unit_price)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e4e4e7; text-align: right;">${formatPrice(item.subtotal)}</td>
    </tr>
  `
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #18181b; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
      <div style="background: #18181b; color: #fafafa; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Aura</h1>
        <p style="margin: 8px 0 0; opacity: 0.8;">Order Confirmation</p>
      </div>

      <div style="padding: 24px;">
        <p style="font-size: 16px; margin-top: 0;">Hi ${order.customer_name},</p>
        <p style="font-size: 16px;">Thank you for your order! We're confirming the details below:</p>

        <div style="background: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;"><strong>Order Number:</strong> #${orderIdShort}</p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;"><strong>Order Date:</strong> ${formatDate(order.created_at)}</p>
          <p style="margin: 0; font-size: 14px; color: #71717a;"><strong>Status:</strong> Pending</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <thead>
            <tr style="background: #f4f4f5;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e4e4e7;">Product</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e4e4e7;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e4e4e7;">Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e4e4e7;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="border-top: 2px solid #e4e4e7; padding-top: 16px; margin-top: 16px;">
          <table style="width: 100%; max-width: 300px; margin-left: auto;">
            <tr>
              <td style="padding: 8px 0; color: #71717a;">Subtotal</td>
              <td style="padding: 8px 0; text-align: right;">${formatPrice(order.subtotal)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a;">Shipping</td>
              <td style="padding: 8px 0; text-align: right;">${order.shipping_cost === 0 ? "Free" : formatPrice(order.shipping_cost)}</td>
            </tr>
            <tr style="border-top: 2px solid #e4e4e7;">
              <td style="padding: 8px 0; font-weight: 600;">Total</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${formatPrice(order.total)}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 24px; padding: 16px; background: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px;">
          <p style="margin: 0 0 8px; font-weight: 600;">Shipping Address</p>
          <p style="margin: 0 0 4px; font-size: 14px;">${order.customer_name}</p>
          <p style="margin: 0 0 4px; font-size: 14px;">${order.shipping_address}</p>
          <p style="margin: 0 0 4px; font-size: 14px;">${order.city}, ${order.state}</p>
          <p style="margin: 0; font-size: 14px;">${order.customer_email}</p>
        </div>

        <p style="margin-top: 24px; font-size: 14px; color: #71717a;">If you have any questions, please contact us.</p>
        <p style="font-size: 14px; color: #71717a;">Thank you for shopping with Aura!</p>
      </div>

      <div style="background: #fafafa; border-top: 1px solid #e4e4e7; padding: 16px 24px; text-align: center; font-size: 12px; color: #71717a;">
        <p style="margin: 0;">© ${new Date().getFullYear()} Aura. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
  `;

  const text = `
Order Confirmation - Aura

Hi ${order.customer_name},

Thank you for your order! We're confirming the details below:

Order Number: #${orderIdShort}
Order Date: ${formatDate(order.created_at)}
Status: Pending

Items:
${order.items.map((item) => `  ${item.products.name} x ${item.quantity} @ ${formatPrice(item.unit_price)} = ${formatPrice(item.subtotal)}`).join("\n")}

Subtotal: ${formatPrice(order.subtotal)}
Shipping: ${order.shipping_cost === 0 ? "Free" : formatPrice(order.shipping_cost)}
Total: ${formatPrice(order.total)}

Shipping Address:
${order.customer_name}
${order.shipping_address}
${order.city}, ${order.state}
${order.customer_email}

Thank you for shopping with Aura!
  `.trim();

  const subject = `Your Aura Order Confirmation #${orderIdShort}`;

  return { subject, html, text };
}