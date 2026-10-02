"use client";

import { useState } from "react";
import { products } from "@/lib/products";
import { Header } from "@/components/shop/Header";
import { ProductCard } from "@/components/shop/ProductCard";
import { useCart } from "@/context/CartContext";

export default function ShopPage() {
  const { addItem } = useCart();
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleAddToCart = (product: typeof products[0]) => {
    setAddingId(product.id);
    addItem(product);
    setTimeout(() => setAddingId(null), 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold text-zinc-950 dark:text-zinc-50">
            Shop
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Curated essentials for everyday living
          </p>
        </div>
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          role="list"
          aria-label="Products"
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              isAdding={addingId === product.id}
            />
          ))}
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