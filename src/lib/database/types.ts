import type { Database } from '@/lib/supabase/database.types';

// Base types from Supabase generated types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderStatus = Database['public']['Enums']['order_status'];

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];
export type OrderItemUpdate = Database['public']['Tables']['order_items']['Update'];

// Extended types for joined queries
export interface OrderWithItems extends Order {
  items: (OrderItem & { product: Product })[];
}

// Database table names (for reference)
export const TABLES = {
  PROFILES: 'profiles',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
} as const;