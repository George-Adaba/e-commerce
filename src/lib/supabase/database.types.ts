// Database types generated from Supabase schema
// This file should be kept in sync with the database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          price: number;
          image_url: string;
          stock_quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          category: string;
          price: number;
          image_url: string;
          stock_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: string;
          price?: number;
          image_url?: string;
          stock_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          shipping_address: string;
          city: string;
          state: string;
          subtotal: number;
          shipping_cost: number;
          total: number;
          status: 'pending' | 'confirmed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone?: string | null;
          shipping_address: string;
          city: string;
          state: string;
          subtotal: number;
          shipping_cost: number;
          total: number;
          status?: 'pending' | 'confirmed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string | null;
          shipping_address?: string;
          city?: string;
          state?: string;
          subtotal?: number;
          shipping_cost?: number;
          total?: number;
          status?: 'pending' | 'confirmed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_user_id_fkey';
            columns: ['user_id'];
            referencedTable: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          subtotal?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            referencedTable: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_product_id_fkey';
            columns: ['product_id'];
            referencedTable: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_order: {
        Args: {
          p_customer_name: string;
          p_customer_email: string;
          p_customer_phone: string;
          p_shipping_address: string;
          p_city: string;
          p_state: string;
          p_items: { product_id: string; quantity: number }[];
        };
        Returns: {
          order_id: string;
          success: boolean;
          error_message: string | null;
        };
      };
    };
    Enums: {
      order_status: 'pending' | 'confirmed' | 'cancelled';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}