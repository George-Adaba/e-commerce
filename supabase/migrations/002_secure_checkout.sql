-- Secure checkout migration
-- Adds a PostgreSQL function for atomic order creation with stock validation

-- ============================================
-- CHECKOUT FUNCTION
-- ============================================

-- Type for checkout item input
CREATE TYPE checkout_item AS (
    product_id UUID,
    quantity INTEGER
);

-- Type for checkout result
CREATE TYPE checkout_result AS (
    order_id UUID,
    success BOOLEAN,
    error_message TEXT
);

-- Function to create order atomically with stock validation
CREATE OR REPLACE FUNCTION create_order(
    p_customer_name TEXT,
    p_customer_email TEXT,
    p_customer_phone TEXT,
    p_shipping_address TEXT,
    p_city TEXT,
    p_state TEXT,
    p_items checkout_item[]
)
RETURNS checkout_result
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_order_id UUID;
    v_subtotal INTEGER := 0;
    v_shipping_cost INTEGER := 1000; -- $10.00 in cents
    v_total INTEGER := 0;
    v_item RECORD;
    v_product RECORD;
    v_result checkout_result;
BEGIN
    -- Verify user is authenticated
    IF v_user_id IS NULL THEN
        v_result := ROW(NULL, FALSE, 'User not authenticated');
        RETURN v_result;
    END IF;

    -- Validate cart is not empty
    IF p_items IS NULL OR array_length(p_items, 1) = 0 THEN
        v_result := ROW(NULL, FALSE, 'Cart is empty');
        RETURN v_result;
    END IF;

    -- Validate each item and calculate subtotal
    FOR i IN 1..array_length(p_items, 1) LOOP
        v_item := p_items[i];

        -- Validate quantity
        IF v_item.quantity IS NULL OR v_item.quantity <= 0 THEN
            v_result := ROW(NULL, FALSE, 'Invalid quantity for product ' || v_item.product_id);
            RETURN v_result;
        END IF;

        -- Get product details (including current price and stock)
        SELECT id, name, price, stock_quantity
        INTO v_product
        FROM products
        WHERE id = v_item.product_id;

        -- Check if product exists
        IF v_product IS NULL THEN
            v_result := ROW(NULL, FALSE, 'Product not found: ' || v_item.product_id);
            RETURN v_result;
        END IF;

        -- Check stock availability
        IF v_product.stock_quantity < v_item.quantity THEN
            v_result := ROW(NULL, FALSE, 'Insufficient stock for product: ' || v_product.name || ' (available: ' || v_product.stock_quantity || ')');
            RETURN v_result;
        END IF;

        -- Calculate item subtotal using authoritative price from database
        v_subtotal := v_subtotal + (v_product.price * v_item.quantity);
    END LOOP;

    -- Calculate shipping (free over $100 = 10000 cents)
    IF v_subtotal >= 10000 THEN
        v_shipping_cost := 0;
    END IF;

    v_total := v_subtotal + v_shipping_cost;

    -- Create the order
    INSERT INTO orders (
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        city,
        state,
        subtotal,
        shipping_cost,
        total,
        status
    ) VALUES (
        v_user_id,
        p_customer_name,
        p_customer_email,
        p_customer_phone,
        p_shipping_address,
        p_city,
        p_state,
        v_subtotal,
        v_shipping_cost,
        v_total,
        'pending'
    ) RETURNING id INTO v_order_id;

    -- Create order items and decrease stock
    FOR i IN 1..array_length(p_items, 1) LOOP
        v_item := p_items[i];

        -- Get product price again (for unit_price)
        SELECT price INTO v_product.price
        FROM products
        WHERE id = v_item.product_id;

        -- Create order item with authoritative price at time of purchase
        INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            unit_price,
            subtotal
        ) VALUES (
            v_order_id,
            v_item.product_id,
            v_item.quantity,
            v_product.price,
            v_product.price * v_item.quantity
        );

        -- Decrease stock
        UPDATE products
        SET stock_quantity = stock_quantity - v_item.quantity,
            updated_at = NOW()
        WHERE id = v_item.product_id;
    END LOOP;

    v_result := ROW(v_order_id, TRUE, NULL);
    RETURN v_result;

EXCEPTION
    WHEN OTHERS THEN
        v_result := ROW(NULL, FALSE, 'Order creation failed: ' || SQLERRM);
        RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_order TO authenticated;

-- ============================================
-- ADDITIONAL INDEXES FOR CHECKOUT PERFORMANCE
-- ============================================

-- Index for faster product lookups during checkout
CREATE INDEX IF NOT EXISTS idx_products_id_price_stock ON products(id, price, stock_quantity);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION create_order IS 'Creates an order atomically with stock validation and price calculation. All monetary values in cents.';