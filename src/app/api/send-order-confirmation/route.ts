import { createServerClient } from "@/lib/supabase";
import { createServiceClient } from "@/lib/supabase";
import { sendOrderConfirmationEmail, buildOrderConfirmationEmail } from "@/lib/mailgun";
import { NextResponse } from "next/server";

interface RequestBody {
  orderId: string;
}

interface Order {
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
}

interface OrderItem {
  products: { name: string };
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    // Get the authenticated user
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Fetch order with items using service role (bypasses RLS for server-side operations)
    const serviceClient = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order, error: orderError } = await (serviceClient.from("orders") as any)
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Fetch order items with product details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: items, error: itemsError } = await (serviceClient.from("order_items") as any)
      .select(`
        *,
        products (
          name
        )
      `)
      .eq("order_id", orderId);

    if (itemsError) {
      return NextResponse.json({ success: false, error: "Failed to fetch order items" }, { status: 500 });
    }

    // Build email content
    const emailData = buildOrderConfirmationEmail({
      ...(order as Order),
      items: (items as OrderItem[]) || [],
    });

    // Send email
    const result = await sendOrderConfirmationEmail({
      to: (order as Order).customer_email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    if (!result.success) {
      // Log error but don't fail the request - order is still successful
      console.error("Failed to send order confirmation email:", result.error);
      return NextResponse.json({ success: true, emailSent: false, warning: "Email delivery failed" });
    }

    return NextResponse.json({ success: true, emailSent: true, messageId: result.messageId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-order-confirmation API:", message);
    // Don't expose internal errors
    return NextResponse.json({ success: true, emailSent: false }, { status: 200 });
  }
}