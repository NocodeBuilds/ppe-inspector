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
          order_num: number | null
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
          order_num?: number | null
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
          order_num?: number | null
          ppe_type?: string
          reference_photo_url?: string | null
          required?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inspection_results: {
        Row: {
          checkpoint_id: string
          created_at: string | null
          id: string
          inspection_id: string | null
          notes: string | null
          passed: boolean | null
          photo_url: string | null
          updated_at: string | null
        }
        Insert: {
          checkpoint_id: string
          created_at?: string | null
          id?: string
          inspection_id?: string | null
          notes?: string | null
          passed?: boolean | null
          photo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          checkpoint_id?: string
          created_at?: string | null
          id?: string
          inspection_id?: string | null
          notes?: string | null
          passed?: boolean | null
          photo_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_results_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "flagged_issues_view"
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
      inspection_templates_new: {
        Row: {
          checkpoints: string[]
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          ppe_type: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          checkpoints: string[]
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          ppe_type: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          checkpoints?: string[]
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          ppe_type?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      inspections: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          images: string[] | null
          inspector_id: string | null
          notes: string | null
          overall_result: string | null
          ppe_id: string | null
          result: string
          signature_url: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          images?: string[] | null
          inspector_id?: string | null
          notes?: string | null
          overall_result?: string | null
          ppe_id?: string | null
          result: string
          signature_url?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          images?: string[] | null
          inspector_id?: string | null
          notes?: string | null
          overall_result?: string | null
          ppe_id?: string | null
          result?: string
          signature_url?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_ppe_id_fkey"
            columns: ["ppe_id"]
            isOneToOne: false
            referencedRelation: "expiring_ppe_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_ppe_id_fkey"
            columns: ["ppe_id"]
            isOneToOne: false
            referencedRelation: "ppe_analytics_view"
            referencedColumns: ["ppe_id"]
          },
          {
            foreignKeyName: "inspections_ppe_id_fkey"
            columns: ["ppe_id"]
            isOneToOne: false
            referencedRelation: "ppe_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_ppe_id_fkey"
            columns: ["ppe_id"]
            isOneToOne: false
            referencedRelation: "upcoming_inspections_view"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          read: boolean | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ppe_checkpoints: {
        Row: {
          created_at: string | null
          id: string
          ppe_type: string
          question: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ppe_type: string
          question: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ppe_type?: string
          question?: string
        }
        Relationships: []
      }
      ppe_items: {
        Row: {
          brand: string
          created_at: string | null
          expiry_date: string
          id: string
          image_url: string | null
          inspection_frequency: string | null
          last_inspection: string | null
          manufacturing_date: string
          model_number: string
          next_inspection: string | null
          serial_number: string
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          brand: string
          created_at?: string | null
          expiry_date: string
          id?: string
          image_url?: string | null
          inspection_frequency?: string | null
          last_inspection?: string | null
          manufacturing_date: string
          model_number: string
          next_inspection?: string | null
          serial_number: string
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          brand?: string
          created_at?: string | null
          expiry_date?: string
          id?: string
          image_url?: string | null
          inspection_frequency?: string | null
          last_inspection?: string | null
          manufacturing_date?: string
          model_number?: string
          next_inspection?: string | null
          serial_number?: string
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string | null
          employee_id: string | null
          employee_role: string | null
          full_name: string | null
          id: string
          mobile: string | null
          role: string | null
          signature: string | null
          site_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          employee_id?: string | null
          employee_role?: string | null
          full_name?: string | null
          id: string
          mobile?: string | null
          role?: string | null
          signature?: string | null
          site_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          employee_id?: string | null
          employee_role?: string | null
          full_name?: string | null
          id?: string
          mobile?: string | null
          role?: string | null
          signature?: string | null
          site_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      report_jobs: {
        Row: {
          created_at: string | null
          format: string
          id: string
          inspection_ids: string[]
          options: Json | null
          report_type: string
          status: string | null
          storage_path: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          format: string
          id?: string
          inspection_ids: string[]
          options?: Json | null
          report_type: string
          status?: string | null
          storage_path?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          format?: string
          id?: string
          inspection_ids?: string[]
          options?: Json | null
          report_type?: string
          status?: string | null
          storage_path?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      unified_inspection_results: {
        Row: {
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          inspection_id: string | null
          remarks: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          inspection_id?: string | null
          remarks?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          inspection_id?: string | null
          remarks?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unified_inspection_results_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "flagged_issues_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_inspection_results_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          ppe_id: string | null
          read: boolean | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          ppe_id?: string | null
          read?: boolean | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          ppe_id?: string | null
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unified_notifications_ppe_id_fkey"
            columns: ["ppe_id"]
            isOneToOne: false
            referencedRelation: "expiring_ppe_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_notifications_ppe_id_fkey"
            columns: ["ppe_id"]
            isOneToOne: false
            referencedRelation: "ppe_analytics_view"
            referencedColumns: ["ppe_id"]
          },
          {
            foreignKeyName: "unified_notifications_ppe_id_fkey"
            columns: ["ppe_id"]
            isOneToOne: false
            referencedRelation: "ppe_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_notifications_ppe_id_fkey"
            columns: ["ppe_id"]
            isOneToOne: false
            referencedRelation: "upcoming_inspections_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      expiring_ppe_view: {
        Row: {
          expiry_date: string | null
          id: string | null
          last_inspection_id: string | null
          next_inspection_date: string | null
          serial_number: string | null
          site_id: string | null
          status: string | null
          time_until_expiry: string | null
          type: string | null
          vendor_details: Json | null
        }
        Insert: {
          expiry_date?: string | null
          id?: string | null
          last_inspection_id?: never
          next_inspection_date?: never
          serial_number?: string | null
          site_id?: never
          status?: string | null
          time_until_expiry?: never
          type?: string | null
          vendor_details?: never
        }
        Update: {
          expiry_date?: string | null
          id?: string | null
          last_inspection_id?: never
          next_inspection_date?: never
          serial_number?: string | null
          site_id?: never
          status?: string | null
          time_until_expiry?: never
          type?: string | null
          vendor_details?: never
        }
        Relationships: []
      }
      flagged_issues_view: {
        Row: {
          failure_remarks: string | null
          id: string | null
          inspection_date: string | null
          inspector_id: string | null
          inspector_name: string | null
          notes: string | null
          ppe_id: string | null
          ppe_type: string | null
          result: string | null
          serial_number: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_ppe_id_fkey"
            columns: ["ppe_id"]
            isOneToOne: false
            referencedRelation: "expiring_ppe_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_ppe_id_fkey"
            columns: ["ppe_id"]
            isOneToOne: false
            referencedRelation: "ppe_analytics_view"
            referencedColumns: ["ppe_id"]
          },
          {
            foreignKeyName: "inspections_ppe_id_fkey"
            columns: ["ppe_id"]
            isOneToOne: false
            referencedRelation: "ppe_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_ppe_id_fkey"
            columns: ["ppe_id"]
            isOneToOne: false
            referencedRelation: "upcoming_inspections_view"
            referencedColumns: ["id"]
          },
        ]
      }
      ppe_analytics_view: {
        Row: {
          failed_inspections: number | null
          passed_inspections: number | null
          ppe_id: string | null
          ppe_type: string | null
          serial_number: string | null
          status: string | null
          total_inspections: number | null
        }
        Relationships: []
      }
      upcoming_inspections_view: {
        Row: {
          id: string | null
          inspection_frequency: string | null
          inspection_status: string | null
          last_inspection: string | null
          last_inspection_result: string | null
          next_inspection_date: string | null
          next_notification_date: string | null
          serial_number: string | null
          status: string | null
          type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "inspector" | "user"
      inspection_type: "pre-use" | "monthly" | "quarterly"
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
      inspection_type: ["pre-use", "monthly", "quarterly"],
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
