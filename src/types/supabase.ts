export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      contracts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          contract_number: string | null
          created_at: string | null
          document_url: string | null
          end_date: string | null
          id: string
          rental_price: number | null
          site_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["contract_status_enum"] | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          contract_number?: string | null
          created_at?: string | null
          document_url?: string | null
          end_date?: string | null
          id?: string
          rental_price?: number | null
          site_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status_enum"] | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          contract_number?: string | null
          created_at?: string | null
          document_url?: string | null
          end_date?: string | null
          id?: string
          rental_price?: number | null
          site_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status_enum"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      document_verifications: {
        Row: {
          created_at: string | null
          document_id: string
          document_type: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["verification_status_enum"] | null
          verified_at: string | null
          verifier_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_id: string
          document_type: string
          id?: string
          notes?: string | null
          status?:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          verified_at?: string | null
          verifier_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string
          document_type?: string
          id?: string
          notes?: string | null
          status?:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          verified_at?: string | null
          verifier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_verifications_verifier_id_fkey"
            columns: ["verifier_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      land_owners: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          id_card_number: string | null
          id_card_url: string | null
          name: string
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          id_card_number?: string | null
          id_card_url?: string | null
          name: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          id_card_number?: string | null
          id_card_url?: string | null
          name?: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: number
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: number
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: number
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      permits: {
        Row: {
          created_at: string | null
          document_url: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          permit_number: string | null
          permit_type: string
          site_id: string
          status: Database["public"]["Enums"]["permit_status_enum"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          permit_number?: string | null
          permit_type: string
          site_id: string
          status?: Database["public"]["Enums"]["permit_status_enum"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          permit_number?: string | null
          permit_type?: string
          site_id?: string
          status?: Database["public"]["Enums"]["permit_status_enum"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permits_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      regionals: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string | null
          id: string
          is_sent: boolean | null
          message: string
          related_id: string
          related_table: string
          reminder_date: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          message: string
          related_id: string
          related_table: string
          reminder_date: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          message?: string
          related_id?: string
          related_table?: string
          reminder_date?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: number
          is_allowed: boolean | null
          permission_name: string
          role_id: string
        }
        Insert: {
          id?: number
          is_allowed?: boolean | null
          permission_name: string
          role_id: string
        }
        Update: {
          id?: number
          is_allowed?: boolean | null
          permission_name?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: Database["public"]["Enums"]["role_name"]
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: Database["public"]["Enums"]["role_name"]
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: Database["public"]["Enums"]["role_name"]
        }
        Relationships: []
      }
      site_types: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          address: string | null
          coordinates: string | null
          created_at: string | null
          id: string
          name: string
          regional_id: number | null
          site_type_id: number | null
          status: string | null
          sto_id: number | null
          updated_at: string | null
          witel_id: number | null
        }
        Insert: {
          address?: string | null
          coordinates?: string | null
          created_at?: string | null
          id?: string
          name: string
          regional_id?: number | null
          site_type_id?: number | null
          status?: string | null
          sto_id?: number | null
          updated_at?: string | null
          witel_id?: number | null
        }
        Update: {
          address?: string | null
          coordinates?: string | null
          created_at?: string | null
          id?: string
          name?: string
          regional_id?: number | null
          site_type_id?: number | null
          status?: string | null
          sto_id?: number | null
          updated_at?: string | null
          witel_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sites_regional_id_fkey"
            columns: ["regional_id"]
            isOneToOne: false
            referencedRelation: "regionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_site_type_id_fkey"
            columns: ["site_type_id"]
            isOneToOne: false
            referencedRelation: "site_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_sto_id_fkey"
            columns: ["sto_id"]
            isOneToOne: false
            referencedRelation: "stos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_witel_id_fkey"
            columns: ["witel_id"]
            isOneToOne: false
            referencedRelation: "witels"
            referencedColumns: ["id"]
          },
        ]
      }
      stos: {
        Row: {
          created_at: string
          id: number
          name: string
          witel_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          witel_id: number
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          witel_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "stos_witel_id_fkey"
            columns: ["witel_id"]
            isOneToOne: false
            referencedRelation: "witels"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          role_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          role_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          role_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      witels: {
        Row: {
          created_at: string
          id: number
          name: string
          regional_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          regional_id: number
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          regional_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "witels_regional_id_fkey"
            columns: ["regional_id"]
            isOneToOne: false
            referencedRelation: "regionals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_expiring_contracts: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      check_expiring_documents: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      custom_access_token_hook: {
        Args: { event: Json }
        Returns: Json
      }
      force_delete_user: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_all_contracts_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          contract_number: string
          start_date: string
          end_date: string
          status: string
          document_url: string
          sites_name: string
        }[]
      }
      get_all_users_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          full_name: string
          email: string
          role_name: string
        }[]
      }
      get_latest_logs: {
        Args: { log_limit: number }
        Returns: {
          id: number
          action: string
          details: Json
          created_at: string
          user_full_name: string
        }[]
      }
      get_user_feed: {
        Args: { p_user_id: string; p_limit: number }
        Returns: {
          id: string
          type: string
          message: string
          link: string
          created_at: string
          is_read: boolean
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role_debug: {
        Args: { p_user_id: string }
        Returns: string
      }
    }
    Enums: {
      contract_status_enum:
        | "Draft"
        | "Waiting Approval"
        | "Approved"
        | "Rejected"
        | "Expired"
      permit_status_enum: "Active" | "Expired" | "In Process"
      role_name: "SuperAdmin" | "Optima" | "Legal" | "Asset"
      verification_status_enum: "Pending" | "Approved" | "Rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      contract_status_enum: [
        "Draft",
        "Waiting Approval",
        "Approved",
        "Rejected",
        "Expired",
      ],
      permit_status_enum: ["Active", "Expired", "In Process"],
      role_name: ["SuperAdmin", "Optima", "Legal", "Asset"],
      verification_status_enum: ["Pending", "Approved", "Rejected"],
    },
  },
} as const
