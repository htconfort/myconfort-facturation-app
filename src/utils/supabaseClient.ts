import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes');
}

// Client Supabase singleton
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types TypeScript générés automatiquement
export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          postal_code: string | null;
          city: string | null;
          siret: string | null;
          lodging_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          postal_code?: string | null;
          city?: string | null;
          siret?: string | null;
          lodging_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          postal_code?: string | null;
          city?: string | null;
          siret?: string | null;
          lodging_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          client_id: string | null;
          client_name: string;
          client_address: string | null;
          client_phone: string | null;
          client_email: string | null;
          subtotal: number;
          tax: number;
          total: number;
          status: string;
          event_location: string | null;
          invoice_date: string;
          due_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          client_id?: string | null;
          client_name: string;
          client_address?: string | null;
          client_phone?: string | null;
          client_email?: string | null;
          subtotal?: number;
          tax?: number;
          total?: number;
          status?: string;
          event_location?: string | null;
          invoice_date?: string;
          due_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          client_id?: string | null;
          client_name?: string;
          client_address?: string | null;
          client_phone?: string | null;
          client_email?: string | null;
          subtotal?: number;
          tax?: number;
          total?: number;
          status?: string;
          event_location?: string | null;
          invoice_date?: string;
          due_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          total: number;
          product_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity?: number;
          unit_price: number;
          total: number;
          product_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          product_id?: string | null;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          category: string;
          size_dimensions: string | null;
          price: number;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          size_dimensions?: string | null;
          price: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          size_dimensions?: string | null;
          price?: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}