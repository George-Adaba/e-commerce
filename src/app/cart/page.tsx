"use client";

import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/shop/Header";
import { Button } from "@/components/ui/Button";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, isLoaded, totalItems } = useCart();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent dark:border-white dark:border-t-transparent" aria-label="Loading cart" />
        </main>
      </div>
    );
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
              Looks like you haven&apos;t added any products yet.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block"
            >
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
          Shopping Cart
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ul className="space-y-4" role="list" aria-label="Cart items">
              {items.map((item) => (
                <li
                  key={item.product.id}
                  className="flex gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm"
                >
                  <Link
                    href={`/product/${item.product.id}`}
                    className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-white"
                    aria-label={`View ${item.product.name}`}
                  >
                    <Image
                      src={item.product.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          href={`/product/${item.product.id}`}
                          className="font-medium text-zinc-950 dark:text-zinc-50 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-white rounded-md -m-1 p-1"
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                          ${item.product.price}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="flex-shrink-0 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-white rounded-lg"
                        aria-label={`Remove ${item.product.name} from cart`}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(q) => updateQuantity(item.product.id, q)}
                        min={1}
                        max={99}
                        aria-label={`Quantity for ${item.product.name}`}
                      />
                      <p className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                        ${item.product.price * item.quantity}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Order Summary</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-600 dark:text-zinc-400">Subtotal ({totalItems} items)</dt>
                  <dd className="font-medium text-zinc-950 dark:text-zinc-50">${subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-600 dark:text-zinc-400">Shipping</dt>
                  <dd className="font-medium text-zinc-950 dark:text-zinc-50">
                    {subtotal >= 100 ? (
                      <span className="text-green-600 dark:text-green-400">Free</span>
                    ) : (
                      "$10.00"
                    )}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-3">
                  <dt className="font-semibold text-zinc-950 dark:text-zinc-50">Total</dt>
                  <dd className="font-semibold text-zinc-950 dark:text-zinc-50">
                    ${(subtotal >= 100 ? subtotal : subtotal + 10).toFixed(2)}
                  </dd>
                </div>
              </dl>
              <div className="mt-6 space-y-3">
                <Link href="/shop">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
                <Link href="/checkout">
                  <Button
                    size="lg"
                    className="w-full"
                    disabled={items.length === 0}
                  >
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-xs text-center text-zinc-500 dark:text-zinc-400">
                Shipping and taxes calculated at checkout.
              </p>
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