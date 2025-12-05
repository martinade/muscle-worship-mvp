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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_id: string
          alert_type: string
          created_at: string | null
          message: string
          read_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          alert_id?: string
          alert_type: string
          created_at?: string | null
          message: string
          read_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          alert_id?: string
          alert_type?: string
          created_at?: string | null
          message?: string
          read_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      availabilityslots: {
        Row: {
          created_at: string | null
          creator_id: string
          end_time: string
          is_blocked: boolean | null
          is_recurring: boolean | null
          recurrence_pattern: string | null
          slot_date: string
          slot_id: string
          slot_type: string | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          end_time: string
          is_blocked?: boolean | null
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          slot_date: string
          slot_id?: string
          slot_type?: string | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          end_time?: string
          is_blocked?: boolean | null
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          slot_date?: string
          slot_id?: string
          slot_type?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availabilityslots_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      bookings: {
        Row: {
          ai_estimate_wc: number | null
          balance_wc: number
          booking_date: string
          booking_id: string
          booking_type: string | null
          created_at: string | null
          creator_id: string
          deposit_wc: number
          duration_minutes: number
          escrow_amount_wc: number | null
          fan_id: string
          final_quote_wc: number | null
          is_legitimate_reason: boolean | null
          location_city: string | null
          location_country: string | null
          reschedule_count: number | null
          reschedule_reason: string | null
          service_fee_wc: number | null
          start_time: string
          status: string | null
          total_fee_wc: number
          travel_bookings: Json | null
          updated_at: string | null
        }
        Insert: {
          ai_estimate_wc?: number | null
          balance_wc: number
          booking_date: string
          booking_id?: string
          booking_type?: string | null
          created_at?: string | null
          creator_id: string
          deposit_wc: number
          duration_minutes: number
          escrow_amount_wc?: number | null
          fan_id: string
          final_quote_wc?: number | null
          is_legitimate_reason?: boolean | null
          location_city?: string | null
          location_country?: string | null
          reschedule_count?: number | null
          reschedule_reason?: string | null
          service_fee_wc?: number | null
          start_time: string
          status?: string | null
          total_fee_wc: number
          travel_bookings?: Json | null
          updated_at?: string | null
        }
        Update: {
          ai_estimate_wc?: number | null
          balance_wc?: number
          booking_date?: string
          booking_id?: string
          booking_type?: string | null
          created_at?: string | null
          creator_id?: string
          deposit_wc?: number
          duration_minutes?: number
          escrow_amount_wc?: number | null
          fan_id?: string
          final_quote_wc?: number | null
          is_legitimate_reason?: boolean | null
          location_city?: string | null
          location_country?: string | null
          reschedule_count?: number | null
          reschedule_reason?: string | null
          service_fee_wc?: number | null
          start_time?: string
          status?: string | null
          total_fee_wc?: number
          travel_bookings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bookings_fan_id_fkey"
            columns: ["fan_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chatmessages: {
        Row: {
          cost_wc: number | null
          created_at: string | null
          flag_reason: string | null
          is_flagged: boolean | null
          media_url: string | null
          message_id: string
          message_text: string | null
          message_type: string | null
          sender_id: string
          session_id: string
        }
        Insert: {
          cost_wc?: number | null
          created_at?: string | null
          flag_reason?: string | null
          is_flagged?: boolean | null
          media_url?: string | null
          message_id?: string
          message_text?: string | null
          message_type?: string | null
          sender_id: string
          session_id: string
        }
        Update: {
          cost_wc?: number | null
          created_at?: string | null
          flag_reason?: string | null
          is_flagged?: boolean | null
          media_url?: string | null
          message_id?: string
          message_text?: string | null
          message_type?: string | null
          sender_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatmessages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "chatmessages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chatsessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      chatsessions: {
        Row: {
          created_at: string | null
          creator_id: string
          ended_at: string | null
          fan_id: string
          free_media_used: number | null
          session_id: string
          started_at: string | null
          status: string | null
          total_cost_wc: number | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          ended_at?: string | null
          fan_id: string
          free_media_used?: number | null
          session_id?: string
          started_at?: string | null
          status?: string | null
          total_cost_wc?: number | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          ended_at?: string | null
          fan_id?: string
          free_media_used?: number | null
          session_id?: string
          started_at?: string | null
          status?: string | null
          total_cost_wc?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chatsessions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "chatsessions_fan_id_fkey"
            columns: ["fan_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cointransactions: {
        Row: {
          amount_wc: number
          balance_after_wc: number
          commission_rate: number | null
          created_at: string | null
          creator_earnings_wc: number | null
          description: string | null
          payment_reference: string | null
          platform_fee_wc: number | null
          related_entity_id: string | null
          related_entity_type: string | null
          transaction_id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount_wc: number
          balance_after_wc: number
          commission_rate?: number | null
          created_at?: string | null
          creator_earnings_wc?: number | null
          description?: string | null
          payment_reference?: string | null
          platform_fee_wc?: number | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          transaction_id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount_wc?: number
          balance_after_wc?: number
          commission_rate?: number | null
          created_at?: string | null
          creator_earnings_wc?: number | null
          description?: string | null
          payment_reference?: string | null
          platform_fee_wc?: number | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          transaction_id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cointransactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      communities: {
        Row: {
          community_id: string
          created_at: string | null
          creator_id: string
          description: string | null
          name: string
          subscription_price_wc: number
          total_subscribers: number | null
          updated_at: string | null
        }
        Insert: {
          community_id?: string
          created_at?: string | null
          creator_id: string
          description?: string | null
          name: string
          subscription_price_wc: number
          total_subscribers?: number | null
          updated_at?: string | null
        }
        Update: {
          community_id?: string
          created_at?: string | null
          creator_id?: string
          description?: string | null
          name?: string
          subscription_price_wc?: number
          total_subscribers?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communities_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      communityposts: {
        Row: {
          community_id: string
          content_text: string | null
          created_at: string | null
          creator_id: string
          expires_at: string | null
          is_paid: boolean | null
          media_urls: string[] | null
          pay_amount_wc: number | null
          poll_options: Json | null
          post_id: string
          post_type: string | null
          scheduled_for: string | null
        }
        Insert: {
          community_id: string
          content_text?: string | null
          created_at?: string | null
          creator_id: string
          expires_at?: string | null
          is_paid?: boolean | null
          media_urls?: string[] | null
          pay_amount_wc?: number | null
          poll_options?: Json | null
          post_id?: string
          post_type?: string | null
          scheduled_for?: string | null
        }
        Update: {
          community_id?: string
          content_text?: string | null
          created_at?: string | null
          creator_id?: string
          expires_at?: string | null
          is_paid?: boolean | null
          media_urls?: string[] | null
          pay_amount_wc?: number | null
          poll_options?: Json | null
          post_id?: string
          post_type?: string | null
          scheduled_for?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communityposts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["community_id"]
          },
          {
            foreignKeyName: "communityposts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      communitysubscriptions: {
        Row: {
          community_id: string
          fan_id: string
          next_renewal_date: string
          status: string | null
          subscribed_at: string | null
          subscription_id: string
        }
        Insert: {
          community_id: string
          fan_id: string
          next_renewal_date: string
          status?: string | null
          subscribed_at?: string | null
          subscription_id?: string
        }
        Update: {
          community_id?: string
          fan_id?: string
          next_renewal_date?: string
          status?: string | null
          subscribed_at?: string | null
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communitysubscriptions_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["community_id"]
          },
          {
            foreignKeyName: "communitysubscriptions_fan_id_fkey"
            columns: ["fan_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      creatorprofiles: {
        Row: {
          average_rating: number | null
          best_body_parts: string[] | null
          body_fat_percentage: number | null
          community_subscription_wc: number | null
          competition_history: string | null
          created_at: string | null
          division: string | null
          gender: string | null
          height_cm: number | null
          inperson_rate_per_hour_wc: number | null
          kyc_verified: boolean | null
          kyc_verified_at: string | null
          max_bench_kg: number | null
          max_deadlift_kg: number | null
          max_squat_kg: number | null
          orientation: string | null
          profile_id: string
          profile_photos: string[] | null
          promo_videos: string[] | null
          selfie_video_url: string | null
          services_offered: string[] | null
          shoe_size: string | null
          specialties: string[] | null
          tax_form_type: string | null
          tax_form_url: string | null
          tax_id_last_four: string | null
          text_chat_rate_wc: number | null
          tier: number | null
          total_reviews: number | null
          total_sessions_completed: number | null
          updated_at: string | null
          user_id: string
          video_call_rate_per_hour_wc: number | null
          webcam_rate_per_min_wc: number | null
          weight_kg: number | null
        }
        Insert: {
          average_rating?: number | null
          best_body_parts?: string[] | null
          body_fat_percentage?: number | null
          community_subscription_wc?: number | null
          competition_history?: string | null
          created_at?: string | null
          division?: string | null
          gender?: string | null
          height_cm?: number | null
          inperson_rate_per_hour_wc?: number | null
          kyc_verified?: boolean | null
          kyc_verified_at?: string | null
          max_bench_kg?: number | null
          max_deadlift_kg?: number | null
          max_squat_kg?: number | null
          orientation?: string | null
          profile_id?: string
          profile_photos?: string[] | null
          promo_videos?: string[] | null
          selfie_video_url?: string | null
          services_offered?: string[] | null
          shoe_size?: string | null
          specialties?: string[] | null
          tax_form_type?: string | null
          tax_form_url?: string | null
          tax_id_last_four?: string | null
          text_chat_rate_wc?: number | null
          tier?: number | null
          total_reviews?: number | null
          total_sessions_completed?: number | null
          updated_at?: string | null
          user_id: string
          video_call_rate_per_hour_wc?: number | null
          webcam_rate_per_min_wc?: number | null
          weight_kg?: number | null
        }
        Update: {
          average_rating?: number | null
          best_body_parts?: string[] | null
          body_fat_percentage?: number | null
          community_subscription_wc?: number | null
          competition_history?: string | null
          created_at?: string | null
          division?: string | null
          gender?: string | null
          height_cm?: number | null
          inperson_rate_per_hour_wc?: number | null
          kyc_verified?: boolean | null
          kyc_verified_at?: string | null
          max_bench_kg?: number | null
          max_deadlift_kg?: number | null
          max_squat_kg?: number | null
          orientation?: string | null
          profile_id?: string
          profile_photos?: string[] | null
          promo_videos?: string[] | null
          selfie_video_url?: string | null
          services_offered?: string[] | null
          shoe_size?: string | null
          specialties?: string[] | null
          tax_form_type?: string | null
          tax_form_url?: string | null
          tax_id_last_four?: string | null
          text_chat_rate_wc?: number | null
          tier?: number | null
          total_reviews?: number | null
          total_sessions_completed?: number | null
          updated_at?: string | null
          user_id?: string
          video_call_rate_per_hour_wc?: number | null
          webcam_rate_per_min_wc?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "creatorprofiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      escrowtransactions: {
        Row: {
          amount_wc: number
          booking_id: string
          created_at: string | null
          escrow_id: string
          locked_at: string | null
          released_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_wc: number
          booking_id: string
          created_at?: string | null
          escrow_id?: string
          locked_at?: string | null
          released_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_wc?: number
          booking_id?: string
          created_at?: string | null
          escrow_id?: string
          locked_at?: string | null
          released_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrowtransactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      fanprofiles: {
        Row: {
          created_at: string | null
          late_cancellation_count: number | null
          no_show_count: number | null
          preferred_body_types: string[] | null
          preferred_gender: string[] | null
          preferred_specialties: string[] | null
          profile_id: string
          total_bookings: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          late_cancellation_count?: number | null
          no_show_count?: number | null
          preferred_body_types?: string[] | null
          preferred_gender?: string[] | null
          preferred_specialties?: string[] | null
          profile_id?: string
          total_bookings?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          late_cancellation_count?: number | null
          no_show_count?: number | null
          preferred_body_types?: string[] | null
          preferred_gender?: string[] | null
          preferred_specialties?: string[] | null
          profile_id?: string
          total_bookings?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fanprofiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      flags: {
        Row: {
          created_at: string | null
          flag_count: number | null
          flag_id: string
          flag_type: string | null
          is_resolved: boolean | null
          reason: string
          related_booking_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          flag_count?: number | null
          flag_id?: string
          flag_type?: string | null
          is_resolved?: boolean | null
          reason: string
          related_booking_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          flag_count?: number | null
          flag_id?: string
          flag_type?: string | null
          is_resolved?: boolean | null
          reason?: string
          related_booking_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flags_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "flags_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      paidmedia: {
        Row: {
          creator_id: string
          fan_id: string
          is_free: boolean | null
          media_id: string
          media_type: string | null
          media_url: string
          price_wc: number
          purchased_at: string | null
          session_id: string | null
        }
        Insert: {
          creator_id: string
          fan_id: string
          is_free?: boolean | null
          media_id?: string
          media_type?: string | null
          media_url: string
          price_wc: number
          purchased_at?: string | null
          session_id?: string | null
        }
        Update: {
          creator_id?: string
          fan_id?: string
          is_free?: boolean | null
          media_id?: string
          media_type?: string | null
          media_url?: string
          price_wc?: number
          purchased_at?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paidmedia_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "paidmedia_fan_id_fkey"
            columns: ["fan_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "paidmedia_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chatsessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          card_brand: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_last_four: string | null
          created_at: string | null
          is_default: boolean | null
          payment_method_id: string
          stripe_payment_method_id: string
          user_id: string
        }
        Insert: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last_four?: string | null
          created_at?: string | null
          is_default?: boolean | null
          payment_method_id?: string
          stripe_payment_method_id: string
          user_id: string
        }
        Update: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last_four?: string | null
          created_at?: string | null
          is_default?: boolean | null
          payment_method_id?: string
          stripe_payment_method_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          account_status: string | null
          city: string | null
          country: string
          created_at: string | null
          date_of_birth: string
          email: string
          password_hash: string
          password_reset_expires: string | null
          password_reset_token: string | null
          role: string
          timezone: string | null
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          account_status?: string | null
          city?: string | null
          country: string
          created_at?: string | null
          date_of_birth: string
          email: string
          password_hash: string
          password_reset_expires?: string | null
          password_reset_token?: string | null
          role: string
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          username: string
        }
        Update: {
          account_status?: string | null
          city?: string | null
          country?: string
          created_at?: string | null
          date_of_birth?: string
          email?: string
          password_hash?: string
          password_reset_expires?: string | null
          password_reset_token?: string | null
          role?: string
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          auto_topup_amount_wc: number | null
          auto_topup_enabled: boolean | null
          auto_topup_threshold_wc: number | null
          balance_wc: number
          created_at: string | null
          escrow_balance_wc: number
          updated_at: string | null
          user_id: string
          wallet_id: string
        }
        Insert: {
          auto_topup_amount_wc?: number | null
          auto_topup_enabled?: boolean | null
          auto_topup_threshold_wc?: number | null
          balance_wc?: number
          created_at?: string | null
          escrow_balance_wc?: number
          updated_at?: string | null
          user_id: string
          wallet_id?: string
        }
        Update: {
          auto_topup_amount_wc?: number | null
          auto_topup_enabled?: boolean | null
          auto_topup_threshold_wc?: number | null
          balance_wc?: number
          created_at?: string | null
          escrow_balance_wc?: number
          updated_at?: string | null
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      webcamsessions: {
        Row: {
          agora_channel_id: string | null
          created_at: string | null
          creator_id: string
          duration_minutes: number | null
          ended_at: string | null
          primary_fan_id: string | null
          rate_per_min_wc: number | null
          room_type: string | null
          session_id: string
          started_at: string | null
          status: string | null
          total_cost_wc: number | null
          voyeur_count: number | null
        }
        Insert: {
          agora_channel_id?: string | null
          created_at?: string | null
          creator_id: string
          duration_minutes?: number | null
          ended_at?: string | null
          primary_fan_id?: string | null
          rate_per_min_wc?: number | null
          room_type?: string | null
          session_id?: string
          started_at?: string | null
          status?: string | null
          total_cost_wc?: number | null
          voyeur_count?: number | null
        }
        Update: {
          agora_channel_id?: string | null
          created_at?: string | null
          creator_id?: string
          duration_minutes?: number | null
          ended_at?: string | null
          primary_fan_id?: string | null
          rate_per_min_wc?: number | null
          room_type?: string | null
          session_id?: string
          started_at?: string | null
          status?: string | null
          total_cost_wc?: number | null
          voyeur_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "webcamsessions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "webcamsessions_primary_fan_id_fkey"
            columns: ["primary_fan_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      process_escrow_lock: {
        Args: { p_amount_wc: number; p_booking_id: string; p_user_id: string }
        Returns: Json
      }
      process_escrow_release: {
        Args: { p_amount_wc: number; p_booking_id: string; p_user_id: string }
        Returns: Json
      }
      process_wallet_transaction: {
        Args: {
          p_amount_wc: number
          p_description?: string
          p_payment_reference?: string
          p_related_entity_id?: string
          p_related_entity_type?: string
          p_transaction_type: string
          p_user_id: string
        }
        Returns: Json
      }
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
