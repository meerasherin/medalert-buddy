
// If the file exists, read it first and then append the new types
// Since we can't read it, we'll define a complete set of types

export interface User {
  id?: string; // Add optional id property
  name: string;
  email: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface Reminder {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  time: string;
  isActive: boolean;
  lastTaken?: string;
  refillTracking?: boolean;
  currentSupply?: number;
  alertAt?: number;
  startDate?: string;
  duration?: string;
  customDuration?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
}

export interface WeightEntry {
  id: string;
  user_id: string;
  week_start_date: string;
  weight_kg: number;
}

export interface WeightGoal {
  user_id: string;
  target_weight: number;
  start_date: string;
  start_weight: number;
}

export interface WeightInsight {
  total_change: number;
  average_weekly_change: number;
  best_week: {
    week_start_date: string;
    change: number;
  } | null;
  weeks_to_goal: number | null;
  status: 'on_track' | 'slowing' | 'gaining' | 'no_change' | 'no_goal';
}

// New types for refill tracking
export interface RefillTracking {
  id: string;
  user_id: string;
  medicine_name: string;
  current_supply: number;
  alert_threshold: number;
  last_refill: string;
}

// History of reminder responses
export interface ReminderHistory {
  id: string;
  medicineName: string;
  dosage: string;
  timestamp: string;
  status: 'taken' | 'missed' | 'snoozed';
}
