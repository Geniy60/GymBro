import type { MuscleGroup } from './types';

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

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
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          note?: string;
          sort_order?: number;
        };
        Update: {
          name?: string;
          note?: string;
          sort_order?: number;
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
          updated_at: string;
          workout_id: string;
        };
        Insert: {
          id: string;
          machine_id?: string | null;
          machine_name_snapshot: string;
          sort_order?: number;
          workout_id: string;
        };
        Update: {
          machine_id?: string | null;
          machine_name_snapshot?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      gymbro_workout_sets: {
        Row: {
          created_at: string;
          exercise_id: string;
          id: string;
          note: string;
          reps: string;
          sort_order: number;
          updated_at: string;
          weight_kg: number | null;
        };
        Insert: {
          exercise_id: string;
          id: string;
          note?: string;
          reps?: string;
          sort_order?: number;
          weight_kg?: number | null;
        };
        Update: {
          note?: string;
          reps?: string;
          sort_order?: number;
          weight_kg?: number | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, Json>;
  };
};
