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
      extended_profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          department: string | null
          employee_id: string | null
          id: string
          location: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          id?: string
          location?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          id?: string
          location?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      inspection_checkpoints: {
        Row: {
          created_at: string | null
          description: string
          id: string
          ppe_type: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          ppe_type: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          ppe_type?: string
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
          passed: boolean
          photo_url: string | null
        }
        Insert: {
          checkpoint_id?: string | null
          created_at?: string | null
          id?: string
          inspection_id?: string | null
          notes?: string | null
          passed: boolean
          photo_url?: string | null
        }
        Update: {
          checkpoint_id?: string | null
          created_at?: string | null
          id?: string
          inspection_id?: string | null
          notes?: string | null
          passed?: boolean
          photo_url?: string | null
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
          created_at: string | null
          date: string | null
          id: string
          inspector_id: string | null
          notes: string | null
          overall_result: string
          ppe_id: string | null
          signature_url: string | null
          type: Database["public"]["Enums"]["inspection_type"]
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          inspector_id?: string | null
          notes?: string | null
          overall_result: string
          ppe_id?: string | null
          signature_url?: string | null
          type: Database["public"]["Enums"]["inspection_type"]
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          inspector_id?: string | null
          notes?: string | null
          overall_result?: string
          ppe_id?: string | null
          signature_url?: string | null
          type?: Database["public"]["Enums"]["inspection_type"]
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
      ppe_items: {
        Row: {
          brand: string
          created_at: string | null
          created_by: string | null
          expiry_date: string
          id: string
          image_url: string | null
          last_inspection: string | null
          manufacturing_date: string
          model_number: string
          next_inspection: string | null
          serial_number: string
          status: Database["public"]["Enums"]["ppe_status"] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          brand: string
          created_at?: string | null
          created_by?: string | null
          expiry_date: string
          id?: string
          image_url?: string | null
          last_inspection?: string | null
          manufacturing_date: string
          model_number: string
          next_inspection?: string | null
          serial_number: string
          status?: Database["public"]["Enums"]["ppe_status"] | null
          type: string
          updated_at?: string | null
        }
        Update: {
          brand?: string
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string
          id?: string
          image_url?: string | null
          last_inspection?: string | null
          manufacturing_date?: string
          model_number?: string
          next_inspection?: string | null
          serial_number?: string
          status?: Database["public"]["Enums"]["ppe_status"] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ppe_items_created_by_fkey"
            columns: ["created_by"]
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
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "inspector" | "user"
      inspection_type: "pre-use" | "monthly" | "quarterly"
      ppe_status: "active" | "expired" | "maintenance" | "flagged"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
