import type { MuscleGroup } from './types';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type Database = {
  public: {
    Tables: {
      gymbro_machines: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          note: string;
          sort_order: number;
          tracking_type: 'strength' | 'cardio';
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          note?: string;
          sort_order?: number;
          tracking_type?: 'strength' | 'cardio';
        };
        Update: {
          name?: string;
          note?: string;
          sort_order?: number;
          tracking_type?: 'strength' | 'cardio';
        };
        Relationships: [];
      };
      gymbro_users: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          sort_order?: number;
        };
        Update: {
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      gymbro_machine_muscle_groups: {
        Row: {
          machine_id: string;
          muscle_group: MuscleGroup;
        };
        Insert: {
          machine_id: string;
          muscle_group: MuscleGroup;
        };
        Update: never;
        Relationships: [];
      };
      gymbro_workouts: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          started_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id: string;
          name: string;
          started_at: string;
          user_id: string;
        };
        Update: {
          name?: string;
          started_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      gymbro_workout_exercises: {
        Row: {
          created_at: string;
          id: string;
          machine_id: string | null;
          machine_name_snapshot: string;
          sort_order: number;
          tracking_type: 'strength' | 'cardio';
          updated_at: string;
          workout_id: string;
        };
        Insert: {
          id: string;
          machine_id?: string | null;
          machine_name_snapshot: string;
          sort_order?: number;
          tracking_type?: 'strength' | 'cardio';
          workout_id: string;
        };
        Update: {
          machine_id?: string | null;
          machine_name_snapshot?: string;
          sort_order?: number;
          tracking_type?: 'strength' | 'cardio';
        };
        Relationships: [];
      };
      gymbro_workout_sets: {
        Row: {
          created_at: string;
          distance_km: number | null;
          duration_seconds: number | null;
          elevation_meters: number | null;
          exercise_id: string;
          id: string;
          incline_percent: number | null;
          note: string;
          reps: string;
          sort_order: number;
          speed_kmh: number | null;
          updated_at: string;
          weight_kg: number | null;
        };
        Insert: {
          distance_km?: number | null;
          duration_seconds?: number | null;
          elevation_meters?: number | null;
          exercise_id: string;
          id: string;
          incline_percent?: number | null;
          note?: string;
          reps?: string;
          sort_order?: number;
          speed_kmh?: number | null;
          weight_kg?: number | null;
        };
        Update: {
          distance_km?: number | null;
          duration_seconds?: number | null;
          elevation_meters?: number | null;
          incline_percent?: number | null;
          note?: string;
          reps?: string;
          sort_order?: number;
          speed_kmh?: number | null;
          weight_kg?: number | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      gymbro_latest_sets_for_machine: {
        Args: {
          p_excluded_workout_id: string;
          p_machine_id: string;
          p_user_id: string;
        };
        Returns: {
          exercise_id: string;
          id: string;
          note: string;
          reps: string;
          duration_seconds: number | null;
          distance_km: number | null;
          incline_percent: number | null;
          elevation_meters: number | null;
          speed_kmh: number | null;
          weight_kg: number | null;
        }[];
      };
      gymbro_latest_cardio_summary: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          machine_id: string | null;
          machine_name: string;
          started_at: string;
          distance_km: number | null;
          elevation_meters: number | null;
          duration_seconds: number | null;
        }[];
      };
      gymbro_cardio_history: {
        Args: {
          p_machine_id: string;
          p_user_id: string;
        };
        Returns: {
          id: string;
          machine_id: string | null;
          machine_name: string;
          started_at: string;
          distance_km: number | null;
          elevation_meters: number | null;
          duration_seconds: number | null;
        }[];
      };
      gymbro_cardio_history_summaries: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          machine_id: string | null;
          machine_name: string;
          started_at: string;
        }[];
      };
      gymbro_machine_history: {
        Args: {
          p_machine_id: string;
          p_user_id: string;
        };
        Returns: {
          id: string;
          max_weight_kg: number | null;
          set_count: number;
          started_at: string;
        }[];
      };
      gymbro_machine_maxes: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          machine_id: string | null;
          machine_name: string;
          started_at: string;
          weight_kg: number;
        }[];
      };
      gymbro_previous_machine_maxes: {
        Args: {
          p_excluded_workout_id: string;
          p_machine_ids: string[];
          p_user_id: string;
        };
        Returns: {
          machine_id: string | null;
          max_weight_kg: number;
        }[];
      };
      gymbro_search_workout_summaries: {
        Args: {
          p_limit: number;
          p_offset: number;
          p_search: string | null;
          p_user_id: string;
        };
        Returns: {
          id: string;
          name: string;
          started_at: string;
          user_id: string;
        }[];
      };
      gymbro_save_workout: {
        Args: {
          p_user_id: string;
          p_workout: Json;
        };
        Returns: undefined;
      };
      gymbro_save_machine: {
        Args: {
          p_machine: Json;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, Json>;
  };
};
