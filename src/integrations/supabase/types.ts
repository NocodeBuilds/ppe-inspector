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
      audit_log: {
        Row: {
          action: string | null
          details: Json | null
          entity: string | null
          entity_id: string | null
          id: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flagged_issues: {
        Row: {
          checkpoint_id: string | null
          created_at: string | null
          description: string | null
          id: string
          inspection_id: string | null
          photo_url: string | null
          ppe_id: string | null
          reported_by: string | null
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          checkpoint_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          inspection_id?: string | null
          photo_url?: string | null
          ppe_id?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          checkpoint_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          inspection_id?: string | null
          photo_url?: string | null
          ppe_id?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flagged_issues_checkpoint_id_fkey"
            columns: ["checkpoint_id"]
            isOneToOne: false
            referencedRelation: "inspection_checkpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flagged_issues_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flagged_issues_ppe_id_fkey"
            columns: ["ppe_id"]
            isOneToOne: false
            referencedRelation: "ppe_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flagged_issues_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_checkpoints: {
        Row: {
          created_at: string | null
          description: string
          id: string
          order: number | null
          ppe_type: string
          required: boolean | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          order?: number | null
          ppe_type: string
          required?: boolean | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          order?: number | null
          ppe_type?: string
          required?: boolean | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_checkpoints_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "inspection_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_results: {
        Row: {
          checkpoint_id: string | null
          created_at: string | null
          description: string | null
          id: string
          inspection_id: string | null
          notes: string | null
          passed: boolean | null
          photo_url: string | null
          updated_at: string | null
        }
        Insert: {
          checkpoint_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          inspection_id?: string | null
          notes?: string | null
          passed?: boolean | null
          photo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          checkpoint_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          inspection_id?: string | null
          notes?: string | null
          passed?: boolean | null
          photo_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_results_checkpoint_id_fkey"
            columns: ["checkpoint_id"]
            isOneToOne: false
            referencedRelation: "inspection_checkpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_results_inspection_id_fkey"
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
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          ppe_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          ppe_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          ppe_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inspections: {
        Row: {
          created_at: string | null
          date: string
          id: string
          inspector_id: string | null
          notes: string | null
          overall_result: string
          ppe_id: string | null
          signature_url: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          inspector_id?: string | null
          notes?: string | null
          overall_result: string
          ppe_id?: string | null
          signature_url?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          inspector_id?: string | null
          notes?: string | null
          overall_result?: string
          ppe_id?: string | null
          signature_url?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_ppe_id_fkey"
            columns: ["ppe_id"]
            isOneToOne: false
            referencedRelation: "ppe_items"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offline_actions: {
        Row: {
          action_type: string | null
          id: string
          payload: Json | null
          status: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action_type?: string | null
          id?: string
          payload?: Json | null
          status?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string | null
          id?: string
          payload?: Json | null
          status?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offline_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ppe_items: {
        Row: {
          assigned_to: string | null
          batch_number: string | null
          brand: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          image_url: string | null
          manufacturing_date: string | null
          model_number: string | null
          next_inspection: string | null
          serial_number: string
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          batch_number?: string | null
          brand?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          manufacturing_date?: string | null
          model_number?: string | null
          next_inspection?: string | null
          serial_number: string
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          batch_number?: string | null
          brand?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          manufacturing_date?: string | null
          model_number?: string | null
          next_inspection?: string | null
          serial_number?: string
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ppe_items_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          employee_role: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          is_admin: boolean | null
          site_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          employee_role?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_admin?: boolean | null
          site_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          employee_role?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_admin?: boolean | null
          site_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          file_url: string | null
          generated_at: string | null
          generated_by: string | null
          id: string
          parameters: Json | null
          related_inspection_ids: Json | null
          type: string
        }
        Insert: {
          file_url?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          parameters?: Json | null
          related_inspection_ids?: Json | null
          type: string
        }
        Update: {
          file_url?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          parameters?: Json | null
          related_inspection_ids?: Json | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          auto_update: boolean | null
          created_at: string | null
          dark_mode: boolean | null
          offline_mode: boolean | null
          push_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_update?: boolean | null
          created_at?: string | null
          dark_mode?: boolean | null
          offline_mode?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_update?: boolean | null
          created_at?: string | null
          dark_mode?: boolean | null
          offline_mode?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      checkpoint_result: "pass" | "fail" | "n/a"
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
    },
  },
} as const
