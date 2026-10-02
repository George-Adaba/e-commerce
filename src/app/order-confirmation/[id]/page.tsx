import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Header } from "@/components/shop/Header";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

interface OrderConfirmationPageProps {
  params: Promise<{ id: string }>;
}

async function getOrderDetails(orderId: string, userId: string) {
  const supabase = await createServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: orderError } = await (supabase.from("orders") as any)
    .select("*")
    .eq("id", orderId)
    .eq("user_id", userId)
    .single();

  if (orderError || !order) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items, error: itemsError } = await (supabase.from("order_items") as any)
    .select(`
      *,
      products (
        id,
        name,
        image_url
      )
    `)
    .eq("order_id", orderId);

  if (itemsError) {
    return null;
  }

  return { order, items: items || [] };
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const resolvedParams = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const orderData = await getOrderDetails(resolvedParams.id, user.id);

  if (!orderData) {
    notFound();
  }

  const { order, items } = orderData;

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pending",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[status] || "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400";
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <svg
            className="mx-auto h-16 w-16 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h1 className="mt-6 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
            Order Confirmed
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Thank you for your purchase! Your order has been placed successfully.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Order Number</p>
              <p className="font-mono text-lg font-medium text-zinc-950 dark:text-zinc-50">
                {order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Placed On</p>
              <p className="font-medium text-zinc-950 dark:text-zinc-50">
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
            >
              {getStatusLabel(order.status)}
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Payment will be processed separately
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm mb-8">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Order Items</h2>
          </div>
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800" role="list" aria-label="Order items">
            {items.map((item: { id: string; products: { id: string; name: string; image_url: string }; quantity: number; unit_price: number; subtotal: number }) => (
              <li key={item.id} className="p-6 flex gap-4">
                <Link
                  href={`/product/${item.products.id}`}
                  className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-white"
                  aria-label={`View ${item.products.name}`}
                >
                  <Image
                    src={item.products.image_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.products.id}`}
                    className="font-medium text-zinc-950 dark:text-zinc-50 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors truncate block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-white rounded-md -m-1 p-1"
                  >
                    {item.products.name}
                  </Link>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    Quantity: {item.quantity} × {formatPrice(item.unit_price)}
                  </p>
                </div>
                <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50 whitespace-nowrap">
                  {formatPrice(item.subtotal)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50 mb-4">Shipping Address</h2>
          <address className="not-italic text-zinc-600 dark:text-zinc-400 space-y-1">
            <p className="font-medium text-zinc-950 dark:text-zinc-50">{order.customer_name}</p>
            <p>{order.shipping_address}</p>
            <p>{order.city}, {order.state}</p>
            {order.customer_phone && <p>{order.customer_phone}</p>}
            <p>{order.customer_email}</p>
          </address>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50 mb-4">Order Summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-600 dark:text-zinc-400">Subtotal</dt>
              <dd className="font-medium text-zinc-950 dark:text-zinc-50">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-600 dark:text-zinc-400">Shipping</dt>
              <dd className="font-medium text-zinc-950 dark:text-zinc-50">
                {order.shipping_cost === 0 ? (
                  <span className="text-green-600 dark:text-green-400">Free</span>
                ) : (
                  formatPrice(order.shipping_cost)
                )}
              </dd>
            </div>
            <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-3">
              <dt className="font-semibold text-zinc-950 dark:text-zinc-50">Total</dt>
              <dd className="font-semibold text-zinc-950 dark:text-zinc-50">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop">
            <Button variant="outline" className="w-full sm:w-auto">
              Continue Shopping
            </Button>
          </Link>
          <Link href={`/orders/${order.id}`}>
            <Button className="w-full sm:w-auto">
              View Order Details
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
          A confirmation email will be sent to {order.customer_email} shortly.
        </p>
      </main>
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} Aura. All rights reserved.
        </div>
      </footer>
    </div>
  );
}