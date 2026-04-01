export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: "super_admin";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null | undefined;
          role?: "super_admin" | undefined;
          is_active?: boolean | undefined;
          created_at?: string | undefined;
          updated_at?: string | undefined;
        };
        Update: {
          id?: string | undefined;
          email?: string | undefined;
          full_name?: string | null | undefined;
          role?: "super_admin" | undefined;
          is_active?: boolean | undefined;
          created_at?: string | undefined;
          updated_at?: string | undefined;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      user_role: "super_admin";
    };
    CompositeTypes: Record<never, never>;
  };
};
