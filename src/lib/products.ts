export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  image: string;
  category: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Minimalist Leather Wallet",
    description:
      "Handcrafted from full-grain vegetable-tanned leather, this minimalist wallet ages beautifully over time. Features 6 card slots, a central cash compartment, and RFID blocking technology. Made in a family-owned workshop using traditional techniques.",
    shortDescription: "Handcrafted full-grain leather wallet with RFID blocking",
    price: 89,
    image: "/products/wallet.svg",
    category: "Accessories",
  },
  {
    id: "2",
    name: "Ceramic Pour-Over Coffee Set",
    description:
      "Elevate your morning ritual with this hand-thrown ceramic pour-over set. Includes a dripper, server, and 100 unbleached paper filters. The double-wall construction keeps coffee hot while the exterior remains cool to touch. Available in matte white and matte black.",
    shortDescription: "Hand-thrown ceramic pour-over set with server and filters",
    price: 65,
    image: "/products/coffee-set.svg",
    category: "Kitchen",
  },
  {
    id: "3",
    name: "Organic Cotton Heavyweight Tee",
    description:
      "Made from 100% GOTS-certified organic cotton, this heavyweight tee (280 GSM) offers structure without stiffness. Pre-shrunk, garment-dyed for a lived-in look, with a relaxed fit and reinforced neck ribbing. Ethically manufactured in Portugal.",
    shortDescription: "280 GSM organic cotton tee, garment-dyed, relaxed fit",
    price: 48,
    image: "/products/tee.svg",
    category: "Apparel",
  },
  {
    id: "4",
    name: "Stainless Steel Insulated Bottle",
    description:
      "Double-wall vacuum insulation keeps drinks cold for 24 hours or hot for 12. The wide mouth fits ice cubes and allows easy cleaning. Powder-coated finish resists scratches and provides a secure grip. BPA-free, leak-proof lid with carry loop.",
    shortDescription: "Double-wall vacuum insulated bottle, 24h cold / 12h hot",
    price: 42,
    image: "/products/bottle.svg",
    category: "Accessories",
  },
  {
    id: "5",
    name: "Solid Oak Cutting Board",
    description:
      "End-grain construction from sustainably sourced European oak. The self-healing surface preserves knife edges while resisting deep cuts. Finished with food-safe mineral oil and beeswax. Includes juice groove and finger holds. Each board varies in grain pattern.",
    shortDescription: "End-grain oak cutting board with juice groove",
    price: 120,
    image: "/products/cutting-board.svg",
    category: "Kitchen",
  },
  {
    id: "6",
    name: "Merino Wool Beanie",
    description:
      "100% superfine merino wool (17.5 micron) for warmth without itch. Double-layer construction with a folded brim. Naturally temperature-regulating, moisture-wicking, and odor-resistant. Machine washable on wool cycle. Made in Scotland.",
    shortDescription: "Superfine merino wool beanie, double-layer, made in Scotland",
    price: 55,
    image: "/products/beanie.svg",
    category: "Apparel",
  },
  {
    id: "7",
    name: "Brass Ballpoint Pen",
    description:
      "Precision-machined from solid brass with a Parker-style refill. Develops a unique patina over time. Weighted for balanced writing. Includes a premium black ink refill and a spare. Packaged in a recycled cardboard box.",
    shortDescription: "Solid brass ballpoint pen, Parker refill, develops patina",
    price: 38,
    image: "/products/pen.svg",
    category: "Accessories",
  },
  {
    id: "8",
    name: "Linen Kitchen Towel Set",
    description:
      "Set of 4 stonewashed European linen towels (45x65 cm). Highly absorbent, quick-drying, and naturally antimicrobial. Become softer with each wash. Oeko-Tex certified. Woven in Lithuania.",
    shortDescription: "Set of 4 stonewashed European linen towels, Oeko-Tex certified",
    price: 52,
    image: "/products/linen-towels.svg",
    category: "Kitchen",
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getCategories(): string[] {
  return [...new Set(products.map((p) => p.category))];
}