"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/shop/Header";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalItems, clearCart, isLoaded } = useCart();
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState<FormData>(() => ({
    fullName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?next=/checkout");
    }
  }, [user, authLoading, router]);

  // Calculate totals (client-side for display only)
  const shippingCost = subtotal >= 10000 ? 0 : 1000; // $10.00 = 1000 cents
  const total = subtotal + shippingCost;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;
    if (items.length === 0) {
      setSubmitError("Your cart is empty");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();

      // Prepare items for the RPC function
      const checkoutItems = items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      // Call the secure checkout RPC function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)("create_order", {
        p_customer_name: formData.fullName.trim(),
        p_customer_email: formData.email.trim(),
        p_customer_phone: formData.phone.trim(),
        p_shipping_address: formData.address.trim(),
        p_city: formData.city.trim(),
        p_state: formData.state.trim(),
        p_items: checkoutItems,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error_message || "Order creation failed");
      }

      // Order created successfully - send confirmation email
      try {
        await fetch("/api/send-order-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.order_id }),
        });
        // Email sending failures are logged server-side but don't block the user flow
      } catch (emailError) {
        console.warn("Failed to send confirmation email:", emailError);
      }

      clearCart();
      router.push(`/order-confirmation/${data.order_id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent dark:border-white dark:border-t-transparent" aria-label="Loading checkout" />
        </main>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent dark:border-white dark:border-t-transparent" aria-label="Checking authentication" />
        </main>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <svg
              className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0h-4v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4H4m16 0l-2 4m0 0l-2-4m2 4H6"
              />
            </svg>
            <h1 className="mt-6 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
              Your cart is empty
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Add some products before proceeding to checkout.
            </p>
            <Link href="/shop" className="mt-6 inline-block">
              <Button size="lg">Continue Shopping</Button>
            </Link>
          </div>
        </main>
        <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} Aura. All rights reserved.
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl sm:text-4xl font-semibold text-zinc-950 dark:text-zinc-50">
          Checkout
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50 mb-6">Customer Information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="fullName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Full Name <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-zinc-950 dark:text-zinc-50 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:focus:ring-white ${errors.fullName ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"}`}
                      placeholder="John Doe"
                      aria-invalid={errors.fullName ? "true" : "false"}
                      aria-describedby={errors.fullName ? "fullName-error" : undefined}
                      disabled={submitting}
                    />
                    {errors.fullName && (
                      <p id="fullName-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                        {errors.fullName}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Email <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-zinc-950 dark:text-zinc-50 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:focus:ring-white ${errors.email ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"}`}
                      placeholder="john@example.com"
                      aria-invalid={errors.email ? "true" : "false"}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      disabled={submitting}
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Phone Number <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-zinc-950 dark:text-zinc-50 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:focus:ring-white ${errors.phone ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"}`}
                      placeholder="+1 (555) 000-0000"
                      aria-invalid={errors.phone ? "true" : "false"}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                      disabled={submitting}
                    />
                    {errors.phone && (
                      <p id="phone-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50 mb-6">Shipping Address</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Address <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-zinc-950 dark:text-zinc-50 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:focus:ring-white ${errors.address ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"}`}
                      placeholder="123 Main Street, Apt 4B"
                      aria-invalid={errors.address ? "true" : "false"}
                      aria-describedby={errors.address ? "address-error" : undefined}
                      disabled={submitting}
                    />
                    {errors.address && (
                      <p id="address-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                        {errors.address}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      City <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-zinc-950 dark:text-zinc-50 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:focus:ring-white ${errors.city ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"}`}
                      placeholder="San Francisco"
                      aria-invalid={errors.city ? "true" : "false"}
                      aria-describedby={errors.city ? "city-error" : undefined}
                      disabled={submitting}
                    />
                    {errors.city && (
                      <p id="city-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                        {errors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      State <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-zinc-950 dark:text-zinc-50 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:focus:ring-white ${errors.state ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"}`}
                      placeholder="CA"
                      aria-invalid={errors.state ? "true" : "false"}
                      aria-describedby={errors.state ? "state-error" : undefined}
                      disabled={submitting}
                    />
                    {errors.state && (
                      <p id="state-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                        {errors.state}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Postal Code <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleChange("postalCode", e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-zinc-950 dark:text-zinc-50 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:focus:ring-white ${errors.postalCode ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"}`}
                      placeholder="94102"
                      aria-invalid={errors.postalCode ? "true" : "false"}
                      aria-describedby={errors.postalCode ? "postalCode-error" : undefined}
                      disabled={submitting}
                    />
                    {errors.postalCode && (
                      <p id="postalCode-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                        {errors.postalCode}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Country <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-zinc-950 dark:text-zinc-50 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:focus:ring-white ${errors.country ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"}`}
                      aria-invalid={errors.country ? "true" : "false"}
                      aria-describedby={errors.country ? "country-error" : undefined}
                      disabled={submitting}
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="JP">Japan</option>
                    </select>
                    {errors.country && (
                      <p id="country-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                        {errors.country}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {submitError && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-red-700 dark:text-red-300" role="alert">
                  {submitError}
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={submitting || items.length === 0} className="w-full sm:w-auto min-w-[200px]">
                  {submitting ? (
                    <>
                      <svg className="mr-2 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Order...
                    </>
                  ) : (
                    `Place Order - ${formatPrice(total)}`
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50 mb-4">Order Summary</h2>

              <ul className="space-y-4 mb-6" role="list" aria-label="Order items">
                {items.map((item) => (
                  <li key={item.product.id} className="flex gap-3">
                    <Link
                      href={`/product/${item.product.id}`}
                      className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-white"
                      aria-label={`View ${item.product.name}`}
                    >
                      <Image
                        src={item.product.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.product.id}`}
                        className="font-medium text-zinc-950 dark:text-zinc-50 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors truncate block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-white rounded-md -m-1 p-1"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Qty: {item.quantity} × {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50 whitespace-nowrap">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <dl className="space-y-3 text-sm border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <div className="flex justify-between">
                  <dt className="text-zinc-600 dark:text-zinc-400">Subtotal ({totalItems} items)</dt>
                  <dd className="font-medium text-zinc-950 dark:text-zinc-50">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-600 dark:text-zinc-400">Shipping</dt>
                  <dd className="font-medium text-zinc-950 dark:text-zinc-50">
                    {shippingCost === 0 ? (
                      <span className="text-green-600 dark:text-green-400">Free</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-3">
                  <dt className="font-semibold text-zinc-950 dark:text-zinc-50">Total</dt>
                  <dd className="font-semibold text-zinc-950 dark:text-zinc-50">{formatPrice(total)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} Aura. All rights reserved.
        </div>
      </footer>
    </div>
  );
}