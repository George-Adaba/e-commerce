-- Initial schema for Aura e-commerce shop
-- Run this migration to create all required tables, relationships, RLS policies, and indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on email for faster lookups
CREATE INDEX idx_profiles_email ON profiles(email);

-- Trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL, -- Stored in cents to avoid floating-point issues
    image_url TEXT NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'cancelled');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    subtotal INTEGER NOT NULL, -- Stored in cents
    shipping_cost INTEGER NOT NULL, -- Stored in cents
    total INTEGER NOT NULL, -- Stored in cents
    status order_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price INTEGER NOT NULL, -- Price at time of purchase, in cents
    subtotal INTEGER NOT NULL, -- unit_price * quantity, in cents
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES RLS POLICIES
-- ============================================
-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- PRODUCTS RLS POLICIES
-- ============================================
-- Anyone (including unauthenticated) can read products
CREATE POLICY "Anyone can view products"
    ON products FOR SELECT
    USING (true);

-- No policies for INSERT/UPDATE/DELETE on products
-- Only service role (admin) can modify products

-- ============================================
-- ORDERS RLS POLICIES
-- ============================================
-- Users can only view their own orders
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own orders
CREATE POLICY "Users can insert own orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own orders (e.g., cancel)
CREATE POLICY "Users can update own orders"
    ON orders FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ORDER ITEMS RLS POLICIES
-- ============================================
-- Users can only view order items for their own orders
CREATE POLICY "Users can view own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Users can only insert order items for their own orders
CREATE POLICY "Users can insert own order items"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );