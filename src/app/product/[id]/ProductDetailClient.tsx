"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/products";
import { Header } from "@/components/shop/Header";
import { Button } from "@/components/ui/Button";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { useCart } from "@/context/CartContext";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = () => {
    setAdding(true);
    addItem(product, quantity);
    setTimeout(() => setAdding(false), 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400" aria-label="Breadcrumb">
          <Link href="/shop" className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors">
            Shop
          </Link>
          <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-zinc-950 dark:text-zinc-50 truncate max-w-xs" aria-current="page">
            {product.name}
          </span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              {product.category}
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold text-zinc-950 dark:text-zinc-50">
              {product.name}
            </h1>
            <p className="mt-4 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
              ${product.price}
            </p>
            <div className="mt-6 prose prose-zinc dark:prose-invert max-w-none">
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{product.description}</p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={99}
                aria-label="Select quantity"
              />
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 sm:flex-none"
                aria-label={`Add ${product.name} to cart`}
              >
                {adding ? "Adding..." : "Add to Cart"}
              </Button>
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-white rounded-md -m-1 p-1"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Continue Shopping
              </Link>
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