"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { totalItems, isLoaded } = useCart();
  const { user, loading, signOut } = useAuth();

  // Use 0 during initial render to match server, then real count after hydration
  const displayTotalItems = isLoaded ? totalItems : 0;

  if (loading) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/shop"
              className="text-xl font-semibold text-zinc-950 dark:text-zinc-50 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-white rounded-lg -m-1 p-1"
              aria-label="Aura Home"
            >
              Aura
            </Link>
            <nav className="flex items-center gap-6" aria-label="Main navigation">
              <Link
                href="/shop"
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-white rounded-md -m-1 p-1"
              >
                Shop
              </Link>
              <Link
                href="/cart"
                className="relative flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-white rounded-md -m-1 p-1"
                aria-label={`Cart, ${displayTotalItems} items`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0h-4v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4H4m16 0l-2 4m0 0l-2-4m2 4H6" />
                </svg>
                <span>Cart</span>
                {displayTotalItems > 0 && (
                  <span
                    className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-950 text-white text-xs font-medium px-1.5 dark:bg-white dark:text-zinc-950"
                    aria-label={`${displayTotalItems} items in cart`}
                  >
                    {displayTotalItems > 99 ? "99+" : displayTotalItems}
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-3" aria-label="Authentication">
                <div className="h-5 w-5 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" aria-hidden="true" />
              </div>
            </nav>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/shop"
            className="text-xl font-semibold text-zinc-950 dark:text-zinc-50 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-white rounded-lg -m-1 p-1"
            aria-label="Aura Home"
          >
            Aura
          </Link>
          <nav className="flex items-center gap-6" aria-label="Main navigation">
            <Link
              href="/shop"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-white rounded-md -m-1 p-1"
            >
              Shop
            </Link>
            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-white rounded-md -m-1 p-1"
              aria-label={`Cart, ${displayTotalItems} items`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0h-4v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4H4m16 0l-2 4m0 0l-2-4m2 4H6" />
              </svg>
              <span>Cart</span>
              {displayTotalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-950 text-white text-xs font-medium px-1.5 dark:bg-white dark:text-zinc-950"
                  aria-label={`${displayTotalItems} items in cart`}
                >
                  {displayTotalItems > 99 ? "99+" : displayTotalItems}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-3" aria-label="Authentication">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 truncate max-w-xs">
                    {user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    aria-label="Sign out"
                  >
                    Sign out
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}