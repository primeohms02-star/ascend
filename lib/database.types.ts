export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      atlas_facts: {
        Row: {
          created_at: string
          fact: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          fact?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          fact?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      atlas_identity: {
        Row: {
          confidence: number | null
          id: string
          identity_description: string
          identity_title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence?: number | null
          id?: string
          identity_description: string
          identity_title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence?: number | null
          id?: string
          identity_description?: string
          identity_title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      atlas_knowledge: {
        Row: {
          category: string
          confidence: number | null
          created_at: string | null
          fact: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          confidence?: number | null
          created_at?: string | null
          fact: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          confidence?: number | null
          created_at?: string | null
          fact?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      atlas_memory: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_mission_date: string | null
          longest_streak: number | null
          memory_type: string | null
          message: string
          metadata: Json | null
          role: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_mission_date?: string | null
          longest_streak?: number | null
          memory_type?: string | null
          message: string
          metadata?: Json | null
          role: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_mission_date?: string | null
          longest_streak?: number | null
          memory_type?: string | null
          message?: string
          metadata?: Json | null
          role?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      atlas_missions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          mission: string
          reason: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          mission: string
          reason?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          mission?: string
          reason?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      atlas_momentum: {
        Row: {
          ascension_score: number | null
          completed_missions: number | null
          current_streak: number | null
          id: string
          longest_streak: number | null
          skipped_missions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ascension_score?: number | null
          completed_missions?: number | null
          current_streak?: number | null
          id?: string
          longest_streak?: number | null
          skipped_missions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ascension_score?: number | null
          completed_missions?: number | null
          current_streak?: number | null
          id?: string
          longest_streak?: number | null
          skipped_missions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      atlas_notifications: {
        Row: {
          created_at: string | null
          id: string
          notification_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notification_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_id?: string
          user_id?: string
        }
        Relationships: []
      }
      atlas_opportunity_impressions: {
        Row: {
          applied: boolean | null
          clerk_id: string
          clicked: boolean | null
          id: string
          impressions: number | null
          last_seen: string | null
          opportunity_id: string
          saved: boolean | null
        }
        Insert: {
          applied?: boolean | null
          clerk_id: string
          clicked?: boolean | null
          id?: string
          impressions?: number | null
          last_seen?: string | null
          opportunity_id: string
          saved?: boolean | null
        }
        Update: {
          applied?: boolean | null
          clerk_id?: string
          clicked?: boolean | null
          id?: string
          impressions?: number | null
          last_seen?: string | null
          opportunity_id?: string
          saved?: boolean | null
        }
        Relationships: []
      }
      atlas_opportunity_memory: {
        Row: {
          company: string | null
          created_at: string | null
          id: string
          opportunity_id: string
          source: string | null
          status: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          id?: string
          opportunity_id: string
          source?: string | null
          status?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          id?: string
          opportunity_id?: string
          source?: string | null
          status?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      atlas_preferences: {
        Row: {
          category: string
          clerk_id: string
          id: string
          score: number
          updated_at: string | null
        }
        Insert: {
          category: string
          clerk_id: string
          id?: string
          score?: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          clerk_id?: string
          id?: string
          score?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      atlas_progress: {
        Row: {
          ascension_score: number
          created_at: string | null
          id: string
          level: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ascension_score?: number
          created_at?: string | null
          id?: string
          level?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ascension_score?: number
          created_at?: string | null
          id?: string
          level?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      atlas_reflections: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          mission_id: string | null
          mood: number | null
          reflection: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          mission_id?: string | null
          mood?: number | null
          reflection: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          mission_id?: string | null
          mood?: number | null
          reflection?: string
          user_id?: string
        }
        Relationships: []
      }
      atlas_strategy: {
        Row: {
          id: string
          monthly_plan: string | null
          objective_90_day: string | null
          today_mission: string | null
          updated_at: string | null
          user_id: string
          vision: string | null
          weekly_plan: string | null
        }
        Insert: {
          id?: string
          monthly_plan?: string | null
          objective_90_day?: string | null
          today_mission?: string | null
          updated_at?: string | null
          user_id: string
          vision?: string | null
          weekly_plan?: string | null
        }
        Update: {
          id?: string
          monthly_plan?: string | null
          objective_90_day?: string | null
          today_mission?: string | null
          updated_at?: string | null
          user_id?: string
          vision?: string | null
          weekly_plan?: string | null
        }
        Relationships: []
      }
      atlas_streaks: {
        Row: {
          created_at: string | null
          current_streak: number
          id: string
          last_mission_date: string | null
          longest_streak: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number
          id?: string
          last_mission_date?: string | null
          longest_streak?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number
          id?: string
          last_mission_date?: string | null
          longest_streak?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      compass_answers: {
        Row: {
          answer: string | null
          clerk_id: string | null
          created_at: string
          id: number
          question_id: number | null
        }
        Insert: {
          answer?: string | null
          clerk_id?: string | null
          created_at?: string
          id?: number
          question_id?: number | null
        }
        Update: {
          answer?: string | null
          clerk_id?: string | null
          created_at?: string
          id?: number
          question_id?: number | null
        }
        Relationships: []
      }
      compass_results: {
        Row: {
          answers: Json
          clerk_id: string
          created_at: string | null
          direction: string | null
          id: string
          next_step: string | null
          north_star: string | null
        }
        Insert: {
          answers: Json
          clerk_id: string
          created_at?: string | null
          direction?: string | null
          id?: string
          next_step?: string | null
          north_star?: string | null
        }
        Update: {
          answers?: Json
          clerk_id?: string
          created_at?: string | null
          direction?: string | null
          id?: string
          next_step?: string | null
          north_star?: string | null
        }
        Relationships: []
      }
      journeys: {
        Row: {
          clerk_id: string
          completed: boolean | null
          created_at: string | null
          description: string | null
          id: string
          title: string
        }
        Insert: {
          clerk_id: string
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
        }
        Update: {
          clerk_id?: string
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      memory: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_mission: string | null
          longest_streak: number | null
          missions_completed: number | null
          missions_missed: number | null
          strengths: string[] | null
          updated_at: string | null
          user_id: string
          weaknesses: string[] | null
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_mission?: string | null
          longest_streak?: number | null
          missions_completed?: number | null
          missions_missed?: number | null
          strengths?: string[] | null
          updated_at?: string | null
          user_id: string
          weaknesses?: string[] | null
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_mission?: string | null
          longest_streak?: number | null
          missions_completed?: number | null
          missions_missed?: number | null
          strengths?: string[] | null
          updated_at?: string | null
          user_id?: string
          weaknesses?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          clerk_id: string
          completed_steps: number | null
          created_at: string | null
          current_streak: number | null
          email: string | null
          full_name: string | null
          id: string
          journey: string | null
          last_mission_date: string | null
          longest_streak: number | null
          north_star: string | null
          progress: number | null
        }
        Insert: {
          clerk_id: string
          completed_steps?: number | null
          created_at?: string | null
          current_streak?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          journey?: string | null
          last_mission_date?: string | null
          longest_streak?: number | null
          north_star?: string | null
          progress?: number | null
        }
        Update: {
          clerk_id?: string
          completed_steps?: number | null
          created_at?: string | null
          current_streak?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          journey?: string | null
          last_mission_date?: string | null
          longest_streak?: number | null
          north_star?: string | null
          progress?: number | null
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
