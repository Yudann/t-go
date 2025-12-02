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
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          color: string | null
          created_at: string
          end_point: string
          estimated_time: number
          fare: number
          id: string
          name: string
          route_code: string
          start_point: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          end_point: string
          estimated_time: number
          fare: number
          id?: string
          name: string
          route_code: string
          start_point: string
        }
        Update: {
          color?: string | null
          created_at?: string
          end_point?: string
          estimated_time?: number
          fare?: number
          id?: string
          name?: string
          route_code?: string
          start_point?: string
        }
        Relationships: []
      }
      route_stops: {
        Row: {
          id: string
          route_id: string
          stop_name: string
          stop_order: number
          latitude: number
          longitude: number
          created_at: string
        }
        Insert: {
          id?: string
          route_id: string
          stop_name: string
          stop_order: number
          latitude: number
          longitude: number
          created_at?: string
        }
        Update: {
          id?: string
          route_id?: string
          stop_name?: string
          stop_order?: number
          latitude?: number
          longitude?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          }
        ]
      }
      tickets: {
        Row: {
          created_at: string
          end_point: string
          id: string
          passenger_count: number
          qr_code: string
          route_id: string
          start_point: string
          status: string
          total_fare: number
          travel_date: string
          updated_at: string
          user_id: string
          payment_status: string | null
        }
        Insert: {
          created_at?: string
          end_point: string
          id?: string
          passenger_count?: number
          qr_code: string
          route_id: string
          start_point: string
          status?: string
          total_fare: number
          travel_date: string
          updated_at?: string
          user_id: string
          payment_status?: string | null
        }
        Update: {
          created_at?: string
          end_point?: string
          id?: string
          passenger_count?: number
          qr_code?: string
          route_id?: string
          start_point?: string
          status?: string
          total_fare?: number
          travel_date?: string
          updated_at?: string
          user_id?: string
          payment_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          id: string
          ticket_id: string | null
          user_id: string | null
          amount: number
          payment_method: string | null
          payment_status: string | null
          transaction_id: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id?: string | null
          user_id?: string | null
          amount: number
          payment_method?: string | null
          payment_status?: string | null
          transaction_id?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string | null
          user_id?: string | null
          amount?: number
          payment_method?: string | null
          payment_status?: string | null
          transaction_id?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Custom types untuk aplikasi
export type Route = Tables<'routes'>
export type RouteStop = Tables<'route_stops'>
export type Ticket = Tables<'tickets'> & {
  routes?: Pick<Route, 'name' | 'route_code' | 'color'>
}
export type Profile = Tables<'profiles'>
export type Payment = Tables<'payments'>