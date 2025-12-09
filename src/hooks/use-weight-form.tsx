
import { useState } from 'react';
import { startOfWeek, format, subWeeks } from 'date-fns';
import { toast } from "sonner";
import { WeightEntry } from '@/types';

interface UseWeightFormProps {
  entries: WeightEntry[];
  addEntry: (entry: Omit<WeightEntry, 'id'>) => Promise<WeightEntry | null>;
  updateEntry: (entry: WeightEntry) => Promise<WeightEntry | null>;
}

export function useWeightForm({ entries, addEntry, updateEntry }: UseWeightFormProps) {
  const [weight, setWeight] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
  
  // Get selected week's start date
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Week starts on Monday
  
  // Find entry for the selected week
  const selectedWeekEntry = entries.find(entry => {
    const entryWeekStart = startOfWeek(new Date(entry.week_start_date), { weekStartsOn: 1 });
    return entryWeekStart.getTime() === weekStart.getTime();
  });
  
  // Helper functions
  const resetToCurrentWeek = () => {
    setSelectedWeek(new Date());
  };

  const goToPreviousWeek = () => {
    setSelectedWeek(prevDate => subWeeks(prevDate, 1));
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedWeek(date);
      setCalendarOpen(false);
    }
  };
  
  const hasEntryForSelectedWeek = () => {
    return entries.some(entry => {
      const entryWeekStart = startOfWeek(new Date(entry.week_start_date), { weekStartsOn: 1 });
      return entryWeekStart.getTime() === weekStart.getTime();
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      toast.error("Please enter a valid weight");
      return;
    }
    
    const weightValue = Number(weight);
    
    if (selectedWeekEntry) {
      // Update existing entry
      await updateEntry({
        ...selectedWeekEntry,
        weight_kg: weightValue
      });
    } else {
      // Add new entry
      await addEntry({
        user_id: '',  // Will be set in the hook
        week_start_date: weekStart.toISOString(),
        weight_kg: weightValue
      });
    }
    
    setWeight("");
  };
  
  return {
    weight,
    setWeight,
    selectedWeek,
    setSelectedWeek,
    calendarOpen,
    setCalendarOpen,
    weekStart,
    hasEntryForSelectedWeek,
    selectedWeekEntry,
    handleSubmit,
    resetToCurrentWeek,
    goToPreviousWeek,
    handleDateSelect
  };
}
