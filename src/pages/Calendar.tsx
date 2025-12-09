
import React, { useState } from 'react';
import Layout from "@/components/Layout";
import { Calendar } from "@/components/ui/calendar";
import { useReminders } from "@/context/ReminderContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { format, isSameDay, startOfDay, endOfDay, addDays, parseISO } from "date-fns";

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { reminders } = useReminders();
  
  // Get reminders for a specific date with improved filtering
  const getRemindersForDate = (date: Date) => {
    if (!date) return [];
    
    // Set the date to start of day for comparison
    const targetDate = startOfDay(date);
    
    return reminders.filter(reminder => {
      // If reminder doesn't have startDate, it can't be scheduled for specific dates
      if (!reminder.startDate) return false;
      
      const startDate = startOfDay(parseISO(reminder.startDate));
      
      // Check if date is before start date
      if (targetDate < startDate) return false;
      
      // Handle different frequencies
      switch (reminder.frequency) {
        case "daily":
          // For ongoing or if within duration range
          if (reminder.duration === "ongoing") return true;
          
          // Calculate end date based on duration
          let durationDays = 0;
          if (reminder.duration === "7days") durationDays = 7;
          else if (reminder.duration === "14days") durationDays = 14;
          else if (reminder.duration === "30days") durationDays = 30;
          else if (reminder.duration === "90days") durationDays = 90;
          else if (reminder.duration === "custom" && reminder.customDuration) {
            durationDays = reminder.customDuration;
          }
          
          const endDate = addDays(startDate, durationDays - 1);
          return targetDate <= endDate;
        
        case "weekly":
          // Check if it's the same day of week
          if (targetDate.getDay() !== startDate.getDay()) return false;
          
          // If ongoing, check only day of week
          if (reminder.duration === "ongoing") return true;
          
          // Calculate weeks based on duration
          let weeks = 0;
          if (reminder.duration === "7days") weeks = 1;
          else if (reminder.duration === "14days") weeks = 2;
          else if (reminder.duration === "30days") weeks = 4;
          else if (reminder.duration === "90days") weeks = 12;
          else if (reminder.duration === "custom" && reminder.customDuration) {
            weeks = Math.ceil(reminder.customDuration / 7);
          }
          
          // Check if within range
          const weekDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
          return weekDiff >= 0 && weekDiff < weeks;
        
        case "monthly":
          // Check if it's the same day of month
          if (targetDate.getDate() !== startDate.getDate()) return false;
          
          // If ongoing, check only day of month
          if (reminder.duration === "ongoing") return true;
          
          // Calculate months based on duration (approximate)
          let months = 0;
          if (reminder.duration === "30days") months = 1;
          else if (reminder.duration === "90days") months = 3;
          else if (reminder.duration === "custom" && reminder.customDuration) {
            months = Math.ceil(reminder.customDuration / 30);
          }
          
          // Calculate month difference
          const monthDiff = (targetDate.getFullYear() - startDate.getFullYear()) * 12 + 
                           (targetDate.getMonth() - startDate.getMonth());
          return monthDiff >= 0 && monthDiff < months;
        
        case "twice_daily":
        case "every_morning":
        case "every_evening":
        case "every_8h":
        case "every_12h":
          // These are handled similar to daily
          if (reminder.duration === "ongoing") return true;
          
          let durDays = 0;
          if (reminder.duration === "7days") durDays = 7;
          else if (reminder.duration === "14days") durDays = 14;
          else if (reminder.duration === "30days") durDays = 30;
          else if (reminder.duration === "90days") durDays = 90;
          else if (reminder.duration === "custom" && reminder.customDuration) {
            durDays = reminder.customDuration;
          }
          
          const durEndDate = addDays(startDate, durDays - 1);
          return targetDate <= durEndDate;
          
        case "once":
          // For one-time reminders, only show on the start date
          return isSameDay(targetDate, startDate);
          
        case "as_needed":
          // As needed reminders don't have specific schedule
          return false;
          
        default:
          return false;
      }
    });
  };

  const remindersForSelectedDate = getRemindersForDate(selectedDate);
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Function to check if a date has any reminders (for dots)
  const hasRemindersOnDate = (date: Date) => {
    return getRemindersForDate(date).length > 0;
  };
  
  // Function to render calendar days with medication indicators
  const renderCalendarDay = (day: Date) => {
    if (hasRemindersOnDate(day)) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <div className="h-1 w-1 bg-primary rounded-full"></div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Layout currentTab="calendar">
      <h1 className="text-xl md:text-2xl font-bold mb-4">Medicine Calendar</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="py-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border pointer-events-auto"
              components={{
                DayContent: ({ date }) => (
                  <>
                    {date.getDate()}
                    {renderCalendarDay(date)}
                  </>
                ),
              }}
            />
          </CardContent>
        </Card>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {formatDate(selectedDate)}
          </h2>
          
          {remindersForSelectedDate.length > 0 ? (
            <div className="space-y-3">
              {remindersForSelectedDate.map((reminder) => {
                // Calculate if reminder is active today
                const isActiveToday = reminder.isActive && (
                  reminder.lastTaken ? 
                    !isSameDay(new Date(reminder.lastTaken), selectedDate) : 
                    true
                );
                
                return (
                  <Card key={reminder.id} className="overflow-hidden">
                    <div className={`h-1 ${isActiveToday ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{reminder.medicineName}</h3>
                          <p className="text-muted-foreground text-sm">{reminder.dosage}</p>
                          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{reminder.time}</span>
                            <Badge variant="outline" className="ml-1 text-xs">
                              {reminder.frequency}
                            </Badge>
                          </div>
                          
                          {reminder.startDate && reminder.duration !== "ongoing" && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {reminder.duration === "custom" 
                                  ? `${reminder.customDuration} days` 
                                  : reminder.duration === "7days" ? "7 days"
                                  : reminder.duration === "14days" ? "14 days"
                                  : reminder.duration === "30days" ? "30 days"
                                  : reminder.duration === "90days" ? "90 days" : ""}
                              </Badge>
                              <span className="ml-1">
                                from {format(new Date(reminder.startDate), 'MMM d, yyyy')}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {reminder.refillTracking && (
                          <div className="text-right">
                            <Badge variant={
                              reminder.currentSupply && reminder.alertAt && 
                              reminder.currentSupply <= reminder.alertAt
                                ? "destructive"
                                : "secondary"
                            }>
                              {reminder.currentSupply} left
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No medications scheduled for this date.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CalendarView;
