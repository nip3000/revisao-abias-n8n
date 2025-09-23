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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      credit_card_bills: {
        Row: {
          card_id: string | null
          closing_date: string
          created_at: string | null
          due_date: string
          id: string
          interest_amount: number
          late_fee: number
          minimum_payment: number
          notes: string | null
          opening_date: string
          paid_amount: number
          payment_date: string | null
          reference_month: number
          reference_year: number
          remaining_amount: number
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          card_id?: string | null
          closing_date: string
          created_at?: string | null
          due_date: string
          id?: string
          interest_amount?: number
          late_fee?: number
          minimum_payment?: number
          notes?: string | null
          opening_date: string
          paid_amount?: number
          payment_date?: string | null
          reference_month: number
          reference_year: number
          remaining_amount?: number
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          card_id?: string | null
          closing_date?: string
          created_at?: string | null
          due_date?: string
          id?: string
          interest_amount?: number
          late_fee?: number
          minimum_payment?: number
          notes?: string | null
          opening_date?: string
          paid_amount?: number
          payment_date?: string | null
          reference_month?: number
          reference_year?: number
          remaining_amount?: number
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_card_bills_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_card_installments: {
        Row: {
          amount: number
          bill_id: string | null
          created_at: string | null
          due_date: string
          id: string
          installment_number: number
          is_paid: boolean | null
          payment_date: string | null
          purchase_id: string | null
        }
        Insert: {
          amount: number
          bill_id?: string | null
          created_at?: string | null
          due_date: string
          id?: string
          installment_number: number
          is_paid?: boolean | null
          payment_date?: string | null
          purchase_id?: string | null
        }
        Update: {
          amount?: number
          bill_id?: string | null
          created_at?: string | null
          due_date?: string
          id?: string
          installment_number?: number
          is_paid?: boolean | null
          payment_date?: string | null
          purchase_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_card_installments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "credit_card_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_card_installments_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "credit_card_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_card_payments: {
        Row: {
          amount: number
          bill_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          bill_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date: string
          payment_method: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          bill_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_card_payments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "credit_card_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_card_payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "poupeja_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_card_purchases: {
        Row: {
          amount: number
          bill_id: string | null
          card_id: string | null
          category_id: string | null
          created_at: string | null
          description: string
          id: string
          installment_amount: number
          installments: number
          is_installment: boolean | null
          merchant: string | null
          purchase_date: string
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          bill_id?: string | null
          card_id?: string | null
          category_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          installment_amount: number
          installments?: number
          is_installment?: boolean | null
          merchant?: string | null
          purchase_date: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bill_id?: string | null
          card_id?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          installment_amount?: number
          installments?: number
          is_installment?: boolean | null
          merchant?: string | null
          purchase_date?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_card_purchases_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "credit_card_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_card_purchases_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_card_purchases_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "poupeja_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_card_purchases_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "poupeja_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_cards: {
        Row: {
          annual_fee: number | null
          available_limit: number
          brand: string
          closing_day: number
          color: string | null
          created_at: string | null
          due_day: number
          id: string
          interest_rate: number | null
          is_active: boolean | null
          last_four_digits: string | null
          name: string
          total_limit: number
          updated_at: string | null
          used_limit: number
          user_id: string
        }
        Insert: {
          annual_fee?: number | null
          available_limit?: number
          brand: string
          closing_day: number
          color?: string | null
          created_at?: string | null
          due_day: number
          id?: string
          interest_rate?: number | null
          is_active?: boolean | null
          last_four_digits?: string | null
          name: string
          total_limit?: number
          updated_at?: string | null
          used_limit?: number
          user_id: string
        }
        Update: {
          annual_fee?: number | null
          available_limit?: number
          brand?: string
          closing_day?: number
          color?: string | null
          created_at?: string | null
          due_day?: number
          id?: string
          interest_rate?: number | null
          is_active?: boolean | null
          last_four_digits?: string | null
          name?: string
          total_limit?: number
          updated_at?: string | null
          used_limit?: number
          user_id?: string
        }
        Relationships: []
      }
      poupeja_accounts: {
        Row: {
          account_number: string | null
          agency: string | null
          bank_id: string | null
          bank_name: string | null
          created_at: string
          id: string
          is_default: boolean
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          agency?: string | null
          bank_id?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          agency?: string | null
          bank_id?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poupeja_accounts_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "poupeja_banks"
            referencedColumns: ["id"]
          },
        ]
      }
      poupeja_banks: {
        Row: {
          code: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      poupeja_categories: {
        Row: {
          color: string
          created_at: string | null
          icon: string | null
          id: string
          is_default: boolean | null
          name: string
          type: string
          user_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          type: string
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      poupeja_customers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          stripe_customer_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          stripe_customer_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          stripe_customer_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      poupeja_goals: {
        Row: {
          color: string | null
          created_at: string | null
          current_amount: number | null
          deadline: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string
          target_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          current_amount?: number | null
          deadline?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date: string
          target_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          current_amount?: number | null
          deadline?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string
          target_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      poupeja_scheduled_transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          description: string | null
          goal_id: string | null
          id: string
          last_execution_date: string | null
          next_execution_date: string | null
          paid_amount: number | null
          paid_date: string | null
          recurrence: string | null
          scheduled_date: string
          status: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          goal_id?: string | null
          id?: string
          last_execution_date?: string | null
          next_execution_date?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          recurrence?: string | null
          scheduled_date: string
          status?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          goal_id?: string | null
          id?: string
          last_execution_date?: string | null
          next_execution_date?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          recurrence?: string | null
          scheduled_date?: string
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poupeja_scheduled_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "poupeja_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poupeja_scheduled_transactions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "poupeja_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      poupeja_settings: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          encrypted: boolean | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string | null
          value_type: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          encrypted?: boolean | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
          value_type?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          encrypted?: boolean | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
          value_type?: string | null
        }
        Relationships: []
      }
      poupeja_settings_history: {
        Row: {
          action: string
          category: string
          changed_at: string | null
          changed_by: string | null
          id: string
          key: string
          new_value: string | null
          old_value: string | null
          setting_id: string | null
        }
        Insert: {
          action: string
          category: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          key: string
          new_value?: string | null
          old_value?: string | null
          setting_id?: string | null
        }
        Update: {
          action?: string
          category?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          key?: string
          new_value?: string | null
          old_value?: string | null
          setting_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poupeja_settings_history_setting_id_fkey"
            columns: ["setting_id"]
            isOneToOne: false
            referencedRelation: "poupeja_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      poupeja_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      poupeja_transactions: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string | null
          created_at: string | null
          credit_card_id: string | null
          date: string
          description: string | null
          goal_id: string | null
          id: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id?: string | null
          created_at?: string | null
          credit_card_id?: string | null
          date: string
          description?: string | null
          goal_id?: string | null
          id?: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string | null
          created_at?: string | null
          credit_card_id?: string | null
          date?: string
          description?: string | null
          goal_id?: string | null
          id?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poupeja_transactions_account_fk"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "poupeja_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poupeja_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "poupeja_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poupeja_transactions_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poupeja_transactions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "poupeja_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      poupeja_uploads: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          purpose: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          purpose?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          purpose?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poupeja_uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "poupeja_users"
            referencedColumns: ["id"]
          },
        ]
      }
      poupeja_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          phone: string | null
          profile_image: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          phone?: string | null
          profile_image?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          profile_image?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_generate_credit_card_bills: {
        Args: { card_id_param: string }
        Returns: undefined
      }
      buscar_cadastro_por_email: {
        Args: { p_email: string }
        Returns: {
          current_period_end: string
          email: string
          plan_type: string
          subscription_status: string
          user_id: string
        }[]
      }
      buscar_cadastro_por_email_phone: {
        Args: { p_email?: string; p_phone?: string }
        Returns: {
          current_period_end: string
          email: string
          phone: string
          plan_type: string
          subscription_status: string
          user_id: string
        }[]
      }
      check_user_role: {
        Args: {
          target_role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Returns: boolean
      }
      confirm_user_email: {
        Args: { user_email: string }
        Returns: boolean
      }
      create_default_account_for_user: {
        Args: { p_user_id?: string }
        Returns: string
      }
      create_default_categories_for_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      create_initial_admin_user: {
        Args: { admin_email?: string }
        Returns: undefined
      }
      create_update_goal_amount_function: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      decrypt_setting_value: {
        Args: { p_encrypted_value: string }
        Returns: string
      }
      encrypt_setting_value: {
        Args: { p_value: string }
        Returns: string
      }
      fix_credit_card_transactions: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_purchases: number
          errors: string[]
          fixed_transactions: number
        }[]
      }
      generate_upload_path: {
        Args: { file_extension: string; user_id: string }
        Returns: string
      }
      get_default_account_id: {
        Args: { p_user_id?: string }
        Returns: string
      }
      get_file_public_url: {
        Args: { file_path: string }
        Returns: string
      }
      get_setting: {
        Args: { p_category: string; p_key: string }
        Returns: string
      }
      get_settings_by_category: {
        Args: { p_category: string }
        Returns: {
          description: string
          encrypted: boolean
          key: string
          value: string
          value_type: string
        }[]
      }
      get_user_subscription_status: {
        Args: { p_user_id?: string }
        Returns: {
          current_period_end: string
          is_active: boolean
          plan_type: string
          status: string
          subscription_id: string
        }[]
      }
      grant_admin_access_to_user: {
        Args: { target_email: string }
        Returns: boolean
      }
      grant_admin_role: {
        Args: { target_email: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      migrate_existing_auth_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      recover_missing_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          recovered_count: number
        }[]
      }
      register_upload: {
        Args: {
          p_file_name: string
          p_file_path: string
          p_file_size?: number
          p_mime_type?: string
          p_purpose?: string
        }
        Returns: string
      }
      safe_make_date: {
        Args: { day_val: number; month_val: number; year_val: number }
        Returns: string
      }
      set_default_account: {
        Args: { p_account_id: string; p_user_id?: string }
        Returns: boolean
      }
      test_trigger_system: {
        Args: Record<PropertyKey, never>
        Returns: {
          details: string
          status: string
          test_name: string
        }[]
      }
      test_user_creation_system: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_credit_card_limits: {
        Args: { card_id_param: string }
        Returns: undefined
      }
      update_goal_amount: {
        Args: { p_amount_change: number; p_goal_id: string }
        Returns: number
      }
      update_subscription_status: {
        Args: {
          p_cancel_at_period_end?: boolean
          p_current_period_end?: string
          p_current_period_start?: string
          p_status: string
          p_stripe_subscription_id: string
        }
        Returns: string
      }
      upsert_setting: {
        Args: {
          p_category: string
          p_description?: string
          p_encrypted?: boolean
          p_key: string
          p_value: string
          p_value_type?: string
        }
        Returns: string
      }
      validate_file_type: {
        Args: { allowed_extensions?: string[]; file_name: string }
        Returns: boolean
      }
      verify_installation: {
        Args: Record<PropertyKey, never>
        Returns: {
          component: string
          details: string
          status: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
