export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          password_hash: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          password_hash: string;
          role?: string;
        };
        Update: {
          name?: string;
          email?: string;
          password_hash?: string;
          role?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_overhead: boolean;
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_overhead?: boolean;
          archived?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          is_overhead?: boolean;
          archived?: boolean;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          archived?: boolean;
        };
        Update: {
          name?: string;
          archived?: boolean;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          type: string;
          amount_cents: number;
          date: string;
          description: string;
          vendor: string | null;
          payer: string | null;
          paid_by: string | null;
          notes: string | null;
          product_id: string | null;
          category_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          amount_cents: number;
          date: string;
          description: string;
          vendor?: string | null;
          payer?: string | null;
          paid_by?: string | null;
          notes?: string | null;
          product_id?: string | null;
          category_id?: string | null;
        };
        Update: {
          type?: string;
          amount_cents?: number;
          date?: string;
          description?: string;
          vendor?: string | null;
          payer?: string | null;
          paid_by?: string | null;
          notes?: string | null;
          product_id?: string | null;
          category_id?: string | null;
        };
        Relationships: [];
      };
      receipts: {
        Row: {
          id: string;
          transaction_id: string;
          file_name: string;
          original_name: string;
          mime_type: string;
          size_bytes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          file_name: string;
          original_name: string;
          mime_type: string;
          size_bytes: number;
        };
        Update: {
          file_name?: string;
          original_name?: string;
          mime_type?: string;
          size_bytes?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type UserRow = Database["public"]["Tables"]["users"]["Row"];
export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
export type ReceiptRow = Database["public"]["Tables"]["receipts"]["Row"];
