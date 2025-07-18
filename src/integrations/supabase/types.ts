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
      checkpoint_groups: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number
          id: string
          template_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order: number
          id?: string
          template_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          template_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkpoint_groups_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "inspection_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      checkpoints: {
        Row: {
          created_at: string | null
          display_order: number
          group_id: string
          help_text: string | null
          id: string
          is_critical: boolean | null
          label: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order: number
          group_id: string
          help_text?: string | null
          id?: string
          is_critical?: boolean | null
          label: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          group_id?: string
          help_text?: string | null
          id?: string
          is_critical?: boolean | null
          label?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkpoints_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "checkpoint_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          id: string
          last_inspection_date: string | null
          location: string | null
          manufacturer: string
          manufacturing_date: string
          model: string | null
          name: string
          next_inspection_date: string | null
          notes: string | null
          organization_id: string
          purchase_date: string | null
          serial_number: string
          status: Database["public"]["Enums"]["equipment_status"] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_inspection_date?: string | null
          location?: string | null
          manufacturer: string
          manufacturing_date: string
          model?: string | null
          name: string
          next_inspection_date?: string | null
          notes?: string | null
          organization_id: string
          purchase_date?: string | null
          serial_number: string
          status?: Database["public"]["Enums"]["equipment_status"] | null
          type: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_inspection_date?: string | null
          location?: string | null
          manufacturer?: string
          manufacturing_date?: string
          model?: string | null
          name?: string
          next_inspection_date?: string | null
          notes?: string | null
          organization_id?: string
          purchase_date?: string | null
          serial_number?: string
          status?: Database["public"]["Enums"]["equipment_status"] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "inspection_statistics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "equipment_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_photos: {
        Row: {
          created_at: string | null
          file_path: string
          id: string
          response_id: string
        }
        Insert: {
          created_at?: string | null
          file_path: string
          id?: string
          response_id: string
        }
        Update: {
          created_at?: string | null
          file_path?: string
          id?: string
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_photos_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "inspection_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_responses: {
        Row: {
          checkpoint_id: string
          created_at: string | null
          id: string
          inspection_id: string
          notes: string | null
          result: Database["public"]["Enums"]["checkpoint_result"]
          updated_at: string | null
        }
        Insert: {
          checkpoint_id: string
          created_at?: string | null
          id?: string
          inspection_id: string
          notes?: string | null
          result: Database["public"]["Enums"]["checkpoint_result"]
          updated_at?: string | null
        }
        Update: {
          checkpoint_id?: string
          created_at?: string | null
          id?: string
          inspection_id?: string
          notes?: string | null
          result?: Database["public"]["Enums"]["checkpoint_result"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_responses_checkpoint_id_fkey"
            columns: ["checkpoint_id"]
            isOneToOne: false
            referencedRelation: "checkpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_responses_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          equipment_type: string
          frequency_days: number | null
          id: string
          is_active: boolean | null
          organization_id: string
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          equipment_type: string
          frequency_days?: number | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          equipment_type?: string
          frequency_days?: number | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          title?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "inspection_statistics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "inspection_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          completion_time: string | null
          created_at: string | null
          equipment_id: string
          flagged: boolean | null
          flagged_reason: string | null
          id: string
          inspector_id: string
          inspector_name: string
          notes: string | null
          organization_id: string
          result: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["inspection_status"] | null
          template_id: string
          updated_at: string | null
        }
        Insert: {
          completion_time?: string | null
          created_at?: string | null
          equipment_id: string
          flagged?: boolean | null
          flagged_reason?: string | null
          id?: string
          inspector_id: string
          inspector_name: string
          notes?: string | null
          organization_id: string
          result?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["inspection_status"] | null
          template_id: string
          updated_at?: string | null
        }
        Update: {
          completion_time?: string | null
          created_at?: string | null
          equipment_id?: string
          flagged?: boolean | null
          flagged_reason?: string | null
          id?: string
          inspector_id?: string
          inspector_name?: string
          notes?: string | null
          organization_id?: string
          result?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["inspection_status"] | null
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "expiring_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "upcoming_inspections"
            referencedColumns: ["equipment_id"]
          },
          {
            foreignKeyName: "inspections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "inspection_statistics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "inspections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "inspection_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          department: string | null
          email: string
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          organization_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          first_name?: string | null
          id: string
          job_title?: string | null
          last_name?: string | null
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "inspection_statistics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      expiring_equipment: {
        Row: {
          age_years: number | null
          expiration_date: string | null
          id: string | null
          is_expired: boolean | null
          lifespan_years: number | null
          manufacturer: string | null
          manufacturing_date: string | null
          name: string | null
          organization_id: string | null
          serial_number: string | null
          type: string | null
        }
        Insert: {
          age_years?: never
          expiration_date?: never
          id?: string | null
          is_expired?: never
          lifespan_years?: never
          manufacturer?: string | null
          manufacturing_date?: string | null
          name?: string | null
          organization_id?: string | null
          serial_number?: string | null
          type?: string | null
        }
        Update: {
          age_years?: never
          expiration_date?: never
          id?: string | null
          is_expired?: never
          lifespan_years?: never
          manufacturer?: string | null
          manufacturing_date?: string | null
          name?: string | null
          organization_id?: string | null
          serial_number?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "inspection_statistics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "equipment_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_statistics: {
        Row: {
          active_equipment: number | null
          draft_inspections: number | null
          failed_inspections: number | null
          flagged_inspections: number | null
          organization_id: string | null
          organization_name: string | null
          passed_inspections: number | null
          retired_equipment: number | null
          total_equipment: number | null
          total_inspections: number | null
          under_repair_equipment: number | null
        }
        Relationships: []
      }
      upcoming_inspections: {
        Row: {
          days_remaining: unknown | null
          equipment_id: string | null
          equipment_name: string | null
          equipment_type: string | null
          next_inspection_date: string | null
          organization_id: string | null
          serial_number: string | null
        }
        Insert: {
          days_remaining?: never
          equipment_id?: string | null
          equipment_name?: string | null
          equipment_type?: string | null
          next_inspection_date?: string | null
          organization_id?: string | null
          serial_number?: string | null
        }
        Update: {
          days_remaining?: never
          equipment_id?: string | null
          equipment_name?: string | null
          equipment_type?: string | null
          next_inspection_date?: string | null
          organization_id?: string | null
          serial_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "inspection_statistics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "equipment_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      checkpoint_result: "pass" | "fail" | "n/a"
      equipment_status: "active" | "inactive" | "under_repair" | "retired"
      inspection_status: "draft" | "completed" | "failed" | "passed"
      user_role: "admin" | "inspector" | "viewer"
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
      checkpoint_result: ["pass", "fail", "n/a"],
      equipment_status: ["active", "inactive", "under_repair", "retired"],
      inspection_status: ["draft", "completed", "failed", "passed"],
      user_role: ["admin", "inspector", "viewer"],
    },
  },
} as const
