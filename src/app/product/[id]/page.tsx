import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { ProductDetailClient } from "./ProductDetailClient";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = await params;
  const product = getProduct(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}