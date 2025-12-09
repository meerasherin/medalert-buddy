import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { WeightEntry, WeightGoal, WeightInsight } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { differenceInWeeks } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// This is a mock implementation - in a real app with Supabase, this would use the Supabase client
export function useWeightEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [goal, setGoal] = useState<WeightGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load entries from Supabase on component mount
  useEffect(() => {
    if (user) {
      fetchWeightEntries();
      fetchWeightGoal();
    } else {
      setEntries([]);
      setGoal(null);
      setIsLoading(false);
    }
  }, [user]);
  
  // Set up realtime subscription for weight entries
  useEffect(() => {
    if (!user) return;
    
    console.log("Setting up weight entries realtime subscription");
    
    const channel = supabase
      .channel('weight_entries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weight_entries',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Weight entry realtime update:', payload);
          fetchWeightEntries();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  const fetchWeightEntries = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start_date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Map Supabase data to WeightEntry type
      const weightEntries: WeightEntry[] = data.map(entry => ({
        id: entry.id,
        user_id: entry.user_id,
        week_start_date: entry.week_start_date,
        weight_kg: Number(entry.weight) // Convert from NUMERIC to Number
      }));
      
      setEntries(weightEntries);
    } catch (error) {
      console.error("Error fetching weight entries:", error);
      toast.error("Failed to load weight entries");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchWeightGoal = async () => {
    if (!user) return;
    
    try {
      // For now, we're using localStorage for goals
      // In a future enhancement, we could add a weight_goals table in Supabase
      const storedGoal = localStorage.getItem(`weight_goal_${user.id}`);
      if (storedGoal) {
        setGoal(JSON.parse(storedGoal));
      }
    } catch (error) {
      console.error("Error loading weight goal:", error);
    }
  };
  
  const addEntry = async (entry: Omit<WeightEntry, 'id'>) => {
    if (!user) {
      toast.error("You must be logged in to record weight");
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('weight_entries')
        .insert({
          user_id: user.id,
          weight: entry.weight_kg,
          week_start_date: entry.week_start_date
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      const newEntry: WeightEntry = {
        id: data.id,
        user_id: data.user_id,
        week_start_date: data.week_start_date,
        weight_kg: Number(data.weight)
      };
      
      setEntries(prev => [newEntry, ...prev]);
      toast.success("Weight recorded successfully");
      return newEntry;
    } catch (error) {
      console.error("Error adding weight entry:", error);
      toast.error("Failed to record weight");
      return null;
    }
  };
  
  const updateEntry = async (updatedEntry: WeightEntry) => {
    if (!user) {
      toast.error("You must be logged in to update weight");
      return null;
    }
    
    try {
      const { error } = await supabase
        .from('weight_entries')
        .update({
          weight: updatedEntry.weight_kg,
          week_start_date: updatedEntry.week_start_date
        })
        .eq('id', updatedEntry.id)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      setEntries(prev => 
        prev.map(entry => 
          entry.id === updatedEntry.id ? updatedEntry : entry
        )
      );
      
      toast.success("Weight updated successfully");
      return updatedEntry;
    } catch (error) {
      console.error("Error updating weight entry:", error);
      toast.error("Failed to update weight");
      return null;
    }
  };
  
  const deleteEntry = async (id: string) => {
    if (!user) {
      toast.error("You must be logged in to delete weight entries");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('weight_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      setEntries(prev => prev.filter(entry => entry.id !== id));
      toast.success("Weight entry deleted");
    } catch (error) {
      console.error("Error deleting weight entry:", error);
      toast.error("Failed to delete weight entry");
    }
  };
  
  const setWeightGoal = (targetWeight: number) => {
    if (!entries.length) return null;
    if (!user) {
      toast.error("You must be logged in to set a weight goal");
      return null;
    }
    
    // Sort entries to get the most recent one
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.week_start_date).getTime() - new Date(a.week_start_date).getTime()
    );
    
    const currentWeight = sortedEntries[0].weight_kg;
    const currentDate = new Date().toISOString();
    
    const newGoal: WeightGoal = {
      user_id: user.id,
      target_weight: targetWeight,
      start_date: currentDate,
      start_weight: currentWeight
    };
    
    // For now, we're using localStorage for goals
    // In a future enhancement, we could add a weight_goals table in Supabase
    localStorage.setItem(`weight_goal_${user.id}`, JSON.stringify(newGoal));
    
    setGoal(newGoal);
    toast.success("Weight goal set successfully");
    return newGoal;
  };
  
  const calculateInsights = (): WeightInsight => {
    const userEntries = entries.filter(entry => entry.user_id === user?.id);
    
    if (!userEntries.length) {
      return {
        total_change: 0,
        average_weekly_change: 0,
        best_week: null,
        weeks_to_goal: null,
        status: 'no_change'
      };
    }
    
    // Sort entries by date
    const sortedEntries = [...userEntries].sort(
      (a, b) => new Date(a.week_start_date).getTime() - new Date(b.week_start_date).getTime()
    );
    
    const firstEntry = sortedEntries[0];
    const lastEntry = sortedEntries[sortedEntries.length - 1];
    const totalChange = lastEntry.weight_kg - firstEntry.weight_kg;
    
    // Calculate weekly changes
    const weeklyChanges = sortedEntries.slice(1).map((entry, index) => {
      const prevEntry = sortedEntries[index];
      return {
        week_start_date: entry.week_start_date,
        change: prevEntry.weight_kg - entry.weight_kg // Positive means weight loss
      };
    });
    
    // Find best performing week (most weight loss)
    const bestWeek = weeklyChanges.length ? 
      weeklyChanges.reduce((best, current) => 
        current.change > best.change ? current : best, weeklyChanges[0]) : null;
    
    // Calculate average weekly change
    const totalWeeks = Math.max(1, differenceInWeeks(
      new Date(lastEntry.week_start_date),
      new Date(firstEntry.week_start_date)
    ));
    const averageWeeklyChange = totalWeeks > 0 ? totalChange / totalWeeks : 0;
    
    // Calculate time to goal
    let weeksToGoal = null;
    let status: WeightInsight['status'] = 'no_change';
    
    if (goal && averageWeeklyChange !== 0) {
      const remainingChange = lastEntry.weight_kg - goal.target_weight;
      
      if (Math.abs(remainingChange) < 0.1) {
        status = 'on_track'; // Already at goal
        weeksToGoal = 0;
      } else if (remainingChange > 0 && averageWeeklyChange > 0) {
        // Losing weight as intended
        weeksToGoal = Math.ceil(remainingChange / Math.abs(averageWeeklyChange));
        status = 'on_track';
      } else if (remainingChange < 0 && averageWeeklyChange < 0) {
        // Gaining weight as intended (for weight gain goals)
        weeksToGoal = Math.ceil(Math.abs(remainingChange) / Math.abs(averageWeeklyChange));
        status = 'on_track';
      } else if (averageWeeklyChange === 0) {
        status = 'no_change';
      } else if ((remainingChange > 0 && averageWeeklyChange < 0) || 
                 (remainingChange < 0 && averageWeeklyChange > 0)) {
        // Moving away from goal
        status = 'gaining';
      } else {
        status = averageWeeklyChange > 0 ? 'on_track' : 'slowing';
      }
    } else if (!goal) {
      status = 'no_goal';
    }
    
    return {
      total_change: totalChange,
      average_weekly_change: averageWeeklyChange,
      best_week: bestWeek,
      weeks_to_goal: weeksToGoal,
      status
    };
  };
  
  return {
    entries: user ? entries : [],
    addEntry,
    updateEntry,
    deleteEntry,
    goal,
    setWeightGoal,
    insights: calculateInsights(),
    isLoading
  };
}
