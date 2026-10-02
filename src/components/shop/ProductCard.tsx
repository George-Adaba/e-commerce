"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/products";
import { Button } from "@/components/ui/Button";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isAdding?: boolean;
}

export function ProductCard({ product, onAddToCart, isAdding }: ProductCardProps) {
  return (
    <article className="group flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-shadow hover:shadow-lg">
      <Link
        href={`/product/${product.id}`}
        className="block relative aspect-square overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-white"
        aria-label={`View ${product.name}`}
      >
        <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800" aria-hidden="true" />
        <Image
          src={product.image}
          alt=""
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          {product.category}
        </p>
        <Link
          href={`/product/${product.id}`}
          className="mt-1 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-white rounded-md -m-1 p-1"
        >
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50 line-clamp-1 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 flex-1">
          {product.shortDescription}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            ${product.price}
          </span>
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product);
            }}
            disabled={isAdding}
            className="w-full sm:w-auto"
            aria-label={`Add ${product.name} to cart`}
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </div>
    </article>
  );
}