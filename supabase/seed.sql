-- Seed data for Aura e-commerce shop
-- Run this after the initial schema migration (001_initial_schema.sql)
-- This seeds the 8 products from the existing catalog

-- Clear existing products (optional, comment out if you want to preserve)
-- TRUNCATE TABLE products RESTART IDENTITY CASCADE;

-- Insert the 8 products from the existing catalog
-- Prices are stored in cents (e.g., 8900 = $89.00)

INSERT INTO products (id, name, description, category, price, image_url, stock_quantity, created_at, updated_at)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'Minimalist Leather Wallet',
        'Handcrafted from full-grain vegetable-tanned leather, this minimalist wallet ages beautifully over time. Features 6 card slots, a central cash compartment, and RFID blocking technology. Made in a family-owned workshop using traditional techniques.',
        'Accessories',
        8900,
        '/products/wallet.svg',
        50,
        NOW(),
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Ceramic Pour-Over Coffee Set',
        'Elevate your morning ritual with this hand-thrown ceramic pour-over set. Includes a dripper, server, and 100 unbleached paper filters. The double-wall construction keeps coffee hot while the exterior remains cool to touch. Available in matte white and matte black.',
        'Kitchen',
        6500,
        '/products/coffee-set.svg',
        30,
        NOW(),
        NOW()
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'Organic Cotton Heavyweight Tee',
        'Made from 100% GOTS-certified organic cotton, this heavyweight tee (280 GSM) offers structure without stiffness. Pre-shrunk, garment-dyed for a lived-in look, with a relaxed fit and reinforced neck ribbing. Ethically manufactured in Portugal.',
        'Apparel',
        4800,
        '/products/tee.svg',
        100,
        NOW(),
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        'Stainless Steel Insulated Bottle',
        'Double-wall vacuum insulation keeps drinks cold for 24 hours or hot for 12. The wide mouth fits ice cubes and allows easy cleaning. Powder-coated finish resists scratches and provides a secure grip. BPA-free, leak-proof lid with carry loop.',
        'Accessories',
        4200,
        '/products/bottle.svg',
        75,
        NOW(),
        NOW()
    ),
    (
        '55555555-5555-5555-5555-555555555555',
        'Solid Oak Cutting Board',
        'End-grain construction from sustainably sourced European oak. The self-healing surface preserves knife edges while resisting deep cuts. Finished with food-safe mineral oil and beeswax. Includes juice groove and finger holds. Each board varies in grain pattern.',
        'Kitchen',
        12000,
        '/products/cutting-board.svg',
        20,
        NOW(),
        NOW()
    ),
    (
        '66666666-6666-6666-6666-666666666666',
        'Merino Wool Beanie',
        '100% superfine merino wool (17.5 micron) for warmth without itch. Double-layer construction with a folded brim. Naturally temperature-regulating, moisture-wicking, and odor-resistant. Machine washable on wool cycle. Made in Scotland.',
        'Apparel',
        5500,
        '/products/beanie.svg',
        60,
        NOW(),
        NOW()
    ),
    (
        '77777777-7777-7777-7777-777777777777',
        'Brass Ballpoint Pen',
        'Precision-machined from solid brass with a Parker-style refill. Develops a unique patina over time. Weighted for balanced writing. Includes a premium black ink refill and a spare. Packaged in a recycled cardboard box.',
        'Accessories',
        3800,
        '/products/pen.svg',
        40,
        NOW(),
        NOW()
    ),
    (
        '88888888-8888-8888-8888-888888888888',
        'Linen Kitchen Towel Set',
        'Set of 4 stonewashed European linen towels (45x65 cm). Highly absorbent, quick-drying, and naturally antimicrobial. Become softer with each wash. Oeko-Tex certified. Woven in Lithuania.',
        'Kitchen',
        5200,
        '/products/linen-towels.svg',
        45,
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    image_url = EXCLUDED.image_url,
    stock_quantity = EXCLUDED.stock_quantity,
    updated_at = NOW();