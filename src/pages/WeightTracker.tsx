
import React, { useState } from 'react';
import { startOfWeek, endOfWeek, format, addDays, subWeeks } from 'date-fns';
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Weight, FileText, Download, LineChart as LineChartIcon, TrendingDown } from "lucide-react";
import { WeightChart } from "@/components/WeightChart";
import { WeightTable } from "@/components/WeightTable";
import { WeightGoalCard } from "@/components/WeightGoalCard";
import { WeightInsightCard } from "@/components/WeightInsightCard";
import { useWeightEntries } from "@/hooks/use-weight-entries";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const WeightTracker = () => {
  const { user } = useAuth();
  const [weight, setWeight] = useState<string>("");
  const [filterCount, setFilterCount] = useState<string>("5");
  const { entries, addEntry, updateEntry, isLoading, goal, setWeightGoal, insights } = useWeightEntries();
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);

  // Generate a consistent user ID for entries, even if the user object doesn't have one
  const userId = user?.id || user?.email || "anonymous";
  
  // Get selected week's start and end dates
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Week starts on Monday
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 }); // Week ends on Sunday
  
  // Get most recent weight value (if exists)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.week_start_date).getTime() - new Date(a.week_start_date).getTime()
  );
  const currentWeight = sortedEntries.length > 0 ? sortedEntries[0].weight_kg : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      toast.error("Please enter a valid weight");
      return;
    }
    
    const weightValue = Number(weight);
    
    // Check if there's an entry for the selected week
    const existingEntry = entries.find(entry => {
      const entryWeekStart = startOfWeek(new Date(entry.week_start_date), { weekStartsOn: 1 });
      return entryWeekStart.getTime() === weekStart.getTime();
    });
    
    if (existingEntry) {
      // Update existing entry
      updateEntry({
        ...existingEntry,
        weight_kg: weightValue
      });
      toast.success("Weight updated for this week");
    } else {
      // Add new entry
      addEntry({
        user_id: userId,
        week_start_date: weekStart.toISOString(),
        weight_kg: weightValue
      });
      toast.success("Weight recorded for this week");
    }
    
    setWeight("");
  };
  
  // Helper function to go back to the current week
  const resetToCurrentWeek = () => {
    setSelectedWeek(new Date());
  };

  // Helper function to go to previous week
  const goToPreviousWeek = () => {
    setSelectedWeek(prevDate => subWeeks(prevDate, 1));
  };
  
  // Determine if the user has already entered weight for the selected week
  const hasEntryForSelectedWeek = () => {
    return entries.some(entry => {
      const entryWeekStart = startOfWeek(new Date(entry.week_start_date), { weekStartsOn: 1 });
      return entryWeekStart.getTime() === weekStart.getTime();
    });
  };
  
  const selectedWeekEntry = entries.find(entry => {
    const entryWeekStart = startOfWeek(new Date(entry.week_start_date), { weekStartsOn: 1 });
    return entryWeekStart.getTime() === weekStart.getTime();
  });
  
  // Handle date selection from calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedWeek(date);
      setCalendarOpen(false);
    }
  };
  
  // Export to CSV
  const exportToCSV = () => {
    if (entries.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    // Format data for CSV
    const csvData = [
      // Header row
      ['Week', 'Date Range', 'Weight (kg)'],
      // Data rows
      ...entries.map((entry, index) => {
        const weekStartDate = new Date(entry.week_start_date);
        const weekEndDate = addDays(weekStartDate, 6);
        return [
          entries.length - index,
          `${format(weekStartDate, "MMM d")} - ${format(weekEndDate, "MMM d, yyyy")}`,
          entry.weight_kg
        ];
      })
    ];
    
    // Convert to CSV format
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'weight_history.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Data exported successfully");
  };

  return (
    <Layout currentTab="weight" onChangeTab={() => {}}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Weight Tracker</h1>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV} disabled={entries.length === 0}>
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Input and Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Weight Input Panel */}
          <Card className="overflow-hidden border-2 border-primary/10 shadow-md">
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Weight className="h-5 w-5 text-primary" />
                {hasEntryForSelectedWeek() ? "Update Your Weight" : "Record Your Weight"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm font-medium">Weight</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      min="30"
                      placeholder={selectedWeekEntry ? `Current: ${selectedWeekEntry.weight_kg} kg` : "Enter your weight"}
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">kg</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="week" className="text-sm font-medium">Week</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goToPreviousWeek}
                      className="flex-shrink-0"
                    >
                      Previous Week
                    </Button>
                    
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="flex-grow justify-start text-left"
                        >
                          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedWeek}
                          onSelect={handleDateSelect}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetToCurrentWeek}
                      className="flex-shrink-0"
                    >
                      Current Week
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Button type="submit" className="w-full group">
                    <Weight className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    {hasEntryForSelectedWeek() ? "Update Weight" : "Record Weight"}
                  </Button>
                </div>
              </form>
              
              {selectedWeekEntry && (
                <div className="mt-6 bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Selected Week:</h3>
                  <div className="mt-3 p-3 bg-primary/5 border border-primary/10 rounded-md flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Recorded weight:</span>
                    <span className="font-medium">{selectedWeekEntry.weight_kg} kg</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Interactive Graph Panel */}
          <Card className="overflow-hidden border shadow-md">
            <CardHeader className="pb-3 bg-gradient-to-r from-muted/30 to-transparent">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-primary" />
                  <span>Weight Trend</span>
                </div>
                
                <Select 
                  value={filterCount} 
                  onValueChange={setFilterCount}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter entries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Last 5 entries</SelectItem>
                    <SelectItem value="10">Last 10 entries</SelectItem>
                    <SelectItem value="15">Last 15 entries</SelectItem>
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <WeightChart 
                  entries={entries} 
                  goal={goal}
                  filterCount={parseInt(filterCount)}
                  isLoading={isLoading}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Weight History Table */}
          <Card className="overflow-hidden border shadow-md">
            <CardHeader className="pb-3 bg-gradient-to-r from-muted/30 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Weight History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeightTable
                entries={entries}
                filterCount={parseInt(filterCount)}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Goal & Insights */}
        <div className="space-y-6">
          {/* Goal & Progress Section */}
          <WeightGoalCard
            goal={goal}
            insights={insights}
            currentWeight={currentWeight}
            onSetGoal={setWeightGoal}
          />
          
          {/* Smart Insights Section */}
          <WeightInsightCard
            insights={insights}
            hasEntries={entries.length > 0}
          />
        </div>
      </div>
    </Layout>
  );
};

export default WeightTracker;
