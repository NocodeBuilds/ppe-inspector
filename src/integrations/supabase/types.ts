export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      inspection_checkpoints: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          guidance_notes: string | null
          id: string
          order_number: number | null
          ppe_type: string
          reference_photo_url: string | null
          required: boolean | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          guidance_notes?: string | null
          id?: string
          order_number?: number | null
          ppe_type: string
          reference_photo_url?: string | null
          required?: boolean | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          guidance_notes?: string | null
          id?: string
          order_number?: number | null
          ppe_type?: string
          reference_photo_url?: string | null
          required?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inspection_results: {
        Row: {
          checkpoint_id: string | null
          created_at: string | null
          id: string
          inspection_id: string | null
          notes: string | null
          passed: boolean | null
          photo_reference_url: string | null
          photo_url: string | null
          updated_at: string | null
          voice_note_url: string | null
        }
        Insert: {
          checkpoint_id?: string | null
          created_at?: string | null
          id?: string
          inspection_id?: string | null
          notes?: string | null
          passed?: boolean | null
          photo_reference_url?: string | null
          photo_url?: string | null
          updated_at?: string | null
          voice_note_url?: string | null
        }
        Update: {
          checkpoint_id?: string | null
          created_at?: string | null
          id?: string
          inspection_id?: string | null
          notes?: string | null
          passed?: boolean | null
          photo_reference_url?: string | null
          photo_url?: string | null
          updated_at?: string | null
          voice_note_url?: string | null
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
      inspections: {
        Row: {
          audio_notes: string | null
          created_at: string | null
          date: string | null
          id: string
          inspector_id: string | null
          next_inspection: string | null
          notes: string | null
          overall_result: string | null
          ppe_id: string | null
          signature_data: string | null
          type: Database["public"]["Enums"]["inspection_type"] | null
          updated_at: string | null
        }
        Insert: {
          audio_notes?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          inspector_id?: string | null
          next_inspection?: string | null
          notes?: string | null
          overall_result?: string | null
          ppe_id?: string | null
          signature_data?: string | null
          type?: Database["public"]["Enums"]["inspection_type"] | null
          updated_at?: string | null
        }
        Update: {
          audio_notes?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          inspector_id?: string | null
          next_inspection?: string | null
          notes?: string | null
          overall_result?: string | null
          ppe_id?: string | null
          signature_data?: string | null
          type?: Database["public"]["Enums"]["inspection_type"] | null
          updated_at?: string | null
        }
        Relationships: [
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
          link: string | null
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ppe_items: {
        Row: {
          assigned_to: string | null
          batch_number: string | null
          brand: string | null
          created_at: string | null
          expiry_date: string | null
          first_use_date: string | null
          id: string
          image_url: string | null
          manufacturing_date: string | null
          model_number: string | null
          next_inspection: string | null
          serial_number: string
          status: Database["public"]["Enums"]["ppe_status"] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          batch_number?: string | null
          brand?: string | null
          created_at?: string | null
          expiry_date?: string | null
          first_use_date?: string | null
          id?: string
          image_url?: string | null
          manufacturing_date?: string | null
          model_number?: string | null
          next_inspection?: string | null
          serial_number: string
          status?: Database["public"]["Enums"]["ppe_status"] | null
          type: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          batch_number?: string | null
          brand?: string | null
          created_at?: string | null
          expiry_date?: string | null
          first_use_date?: string | null
          id?: string
          image_url?: string | null
          manufacturing_date?: string | null
          model_number?: string | null
          next_inspection?: string | null
          serial_number?: string
          status?: Database["public"]["Enums"]["ppe_status"] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string | null
          employee_id: string | null
          employee_role: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          site_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          employee_id?: string | null
          employee_role?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"] | null
          site_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          employee_id?: string | null
          employee_role?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          site_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "admin" | "inspector" | "user"
      inspection_type: "pre-use" | "monthly" | "quarterly" | "annual"
      ppe_status:
        | "active"
        | "expired"
        | "flagged"
        | "due"
        | "inspected"
        | "out-of-service"
        | "maintenance"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "inspector", "user"],
      inspection_type: ["pre-use", "monthly", "quarterly", "annual"],
      ppe_status: [
        "active",
        "expired",
        "flagged",
        "due",
        "inspected",
        "out-of-service",
        "maintenance",
      ],
    },
  },
} as const
