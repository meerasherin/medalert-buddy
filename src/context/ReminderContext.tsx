import React, { createContext, useContext, useState, useEffect } from "react";
import { Reminder } from "@/types";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/context/AuthContext";
import { mobileNotificationService } from "@/services/mobileNotifications";
import { Capacitor } from '@capacitor/core';

export interface ReminderContextType {
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, "id" | "isActive">) => void;
  updateReminder: (reminder: Reminder) => void;
  deleteReminder: (id: string) => void;
  dismissReminder: (id: string) => void;
  snoozeReminder: (id: string, minutes: number) => void;
  getReminderById: (id: string) => Reminder | undefined;
  reminderHistory: { id: string; medicineName: string; dosage: string; timestamp: string; status: "taken" | "missed" | "snoozed" }[];
  getRemindersForDate: (date: Date) => Reminder[];
  getRefillReminders: () => Reminder[];
}

const ReminderContext = createContext<ReminderContextType>({
  reminders: [],
  addReminder: () => {},
  updateReminder: () => {},
  deleteReminder: () => {},
  dismissReminder: () => {},
  snoozeReminder: () => {},
  getReminderById: () => undefined,
  reminderHistory: [],
  getRemindersForDate: () => [],
  getRefillReminders: () => []
});

export const ReminderProvider = ({ children }: { children: React.ReactNode }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [reminderHistory, setReminderHistory] = useState<Array<{ 
    id: string; 
    medicineName: string; 
    dosage: string; 
    timestamp: string; 
    status: "taken" | "missed" | "snoozed" 
  }>>([]);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  // Generate user-specific storage keys
  const getUserStorageKey = (key: string) => {
    if (!user) return key;
    return `${key}_${user.email}`;
  };
  
  // Initialize mobile notifications
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      mobileNotificationService.initialize().then(success => {
        if (success) {
          mobileNotificationService.setupNotificationCategories();
          console.log('Mobile notifications initialized successfully');
        }
      });

      // Listen for notification actions
      const handleMedicineAction = (event: CustomEvent) => {
        const { reminderId, action } = event.detail;
        if (action === 'take') {
          dismissReminder(reminderId);
        } else if (action === 'snooze') {
          snoozeReminder(reminderId, 10);
        }
      };

      window.addEventListener('medicineActionTaken', handleMedicineAction as EventListener);
      
      return () => {
        window.removeEventListener('medicineActionTaken', handleMedicineAction as EventListener);
      };
    }
  }, []);
  
  // Register for push notifications
  const registerForPushNotifications = async () => {
    try {
      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return;
      }

      if (Notification.permission === 'granted') {
        return true;
      }
      
      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };
  
  // Load reminders from localStorage on mount or when user changes
  useEffect(() => {
    // Only load data if we have a user
    if (!user) {
      setReminders([]);
      setReminderHistory([]);
      return;
    }
    
    // Check for existing reminders in localStorage
    const storedReminders = localStorage.getItem(getUserStorageKey("myMedReminders"));
    if (storedReminders) {
      try {
        setReminders(JSON.parse(storedReminders));
      } catch (error) {
        console.error("Failed to parse stored reminders:", error);
      }
    }
    
    // Load reminder history
    const storedHistory = localStorage.getItem(getUserStorageKey("myMedHistory"));
    if (storedHistory) {
      try {
        setReminderHistory(JSON.parse(storedHistory));
      } catch (error) {
        console.error("Failed to parse stored history:", error);
      }
    }
    
    // Initialize audio
    const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3");
    audio.loop = true;
    setAudioElement(audio);
    
    // Request notification permission
    registerForPushNotifications();
    
    // Register URL parameter handlers for service worker actions
    const handleURLParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get('action');
      const id = urlParams.get('id');
      
      if (action && id) {
        if (action === 'take') {
          const reminder = reminders.find(r => r.id === id);
          if (reminder) {
            dismissReminder(id);
          }
        } else if (action === 'snooze') {
          const reminder = reminders.find(r => r.id === id);
          if (reminder) {
            snoozeReminder(id, 10); // Default snooze 10 minutes
          }
        }
        
        // Clean URL after processing
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    
    handleURLParams();
    window.addEventListener('focus', handleURLParams);
    
    // Return cleanup function
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      window.removeEventListener('focus', handleURLParams);
    };
  }, [user]);
  
  // Save reminders to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(getUserStorageKey("myMedReminders"), JSON.stringify(reminders));
    }
  }, [reminders, user]);
  
  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(getUserStorageKey("myMedHistory"), JSON.stringify(reminderHistory));
    }
  }, [reminderHistory, user]);
  
  // Setup reminder checking interval
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      reminders.forEach(reminder => {
        if (!reminder.isActive) return;
        
        // Parse the reminder time
        const [hours, minutes] = reminder.time.split(':').map(Number);
        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);
        
        // Calculate time difference in minutes
        const timeDiffMs = Math.abs(now.getTime() - reminderTime.getTime());
        const timeDiffMinutes = timeDiffMs / (1000 * 60);
        
        // If current time is within 1 minute of the reminder time
        if (timeDiffMinutes < 1 && now >= reminderTime) {
          // Check if we already triggered notification recently (within last 2 minutes)
          const lastTriggered = reminder.lastTaken ? new Date(reminder.lastTaken) : null;
          const canTrigger = !lastTriggered || ((now.getTime() - lastTriggered.getTime()) > 120000);
          
          if (canTrigger) {
            triggerNotification(reminder);
          }
        }
      });
    };
    
    // Check every 30 seconds
    const interval = setInterval(checkReminders, 30000);
    // Also check immediately
    checkReminders();
    
    return () => clearInterval(interval);
  }, [reminders]);

  const getReminderById = (id: string) => {
    return reminders.find(r => r.id === id);
  };
  
  const triggerNotification = (reminder: Reminder) => {
    // Trigger haptic feedback on mobile
    if (Capacitor.isNativePlatform()) {
      mobileNotificationService.triggerHapticFeedback();
    }

    // Play sound
    if (audioElement) {
      audioElement.play().catch(err => console.error("Failed to play notification sound:", err));
    }
    
    // Show notification
    if (Capacitor.isNativePlatform()) {
      // Use native notifications on mobile
      mobileNotificationService.scheduleNotification({
        id: parseInt(reminder.id.replace(/\D/g, '').slice(0, 8)) || Math.floor(Math.random() * 1000000),
        title: "MyMed Reminder",
        body: `Take ${reminder.dosage} of ${reminder.medicineName} now`,
        scheduleAt: new Date(), // Immediate notification
        reminderId: reminder.id
      });
    } else if (Notification.permission === "granted") {
      // Fallback to web notifications
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
          const notificationOptions: NotificationOptions = {
            body: `Take ${reminder.dosage} of ${reminder.medicineName} now`,
            icon: "/icons/icon-192x192.png",
            badge: "/icons/icon-72x72.png",
            data: {
              reminderId: reminder.id,
              dateOfArrival: Date.now(),
              primaryKey: 1
            }
          };
          
          registration.showNotification("MyMed Reminder", notificationOptions);
          
          if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
            navigator.vibrate([100, 50, 100]);
          }
        });
      } else {
        const notification = new Notification("MyMed Reminder", {
          body: `Take ${reminder.dosage} of ${reminder.medicineName} now`,
          icon: "/icons/icon-192x192.png",
        });
        
        notification.onclick = () => {
          window.focus();
          notification.close();
          dismissReminder(reminder.id);
        };
        
        if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
          navigator.vibrate([100, 50, 100]);
        }
      }
    } else {
      // Fallback if notifications not allowed
      toast(`Time to take ${reminder.dosage} of ${reminder.medicineName}`, {
        action: {
          label: "Dismiss",
          onClick: () => dismissReminder(reminder.id)
        },
        duration: 0
      });
    }
    
    // Update reminder to show it's active
    const updatedReminder = { ...reminder, isActive: true };
    updateReminder(updatedReminder);
  };
  
  const addReminder = (reminderData: Omit<Reminder, "id" | "isActive">) => {
    const newReminder: Reminder = {
      ...reminderData,
      id: uuidv4(),
      isActive: true,
    };
    
    // Schedule mobile notification if on native platform
    if (Capacitor.isNativePlatform()) {
      const [hours, minutes] = newReminder.time.split(':').map(Number);
      const notificationTime = new Date();
      notificationTime.setHours(hours, minutes, 0, 0);
      
      // If the time has passed today, schedule for tomorrow
      if (notificationTime <= new Date()) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }
      
      mobileNotificationService.scheduleNotification({
        id: parseInt(newReminder.id.replace(/\D/g, '').slice(0, 8)) || Math.floor(Math.random() * 1000000),
        title: "MyMed Reminder",
        body: `Time to take ${newReminder.dosage} of ${newReminder.medicineName}`,
        scheduleAt: notificationTime,
        reminderId: newReminder.id
      });
    }
    
    setReminders(prev => [...prev, newReminder]);
    toast.success(`Added reminder for ${newReminder.medicineName}`);
  };
  
  const updateReminder = (updatedReminder: Reminder) => {
    setReminders(prev => 
      prev.map(r => r.id === updatedReminder.id ? updatedReminder : r)
    );
  };
  
  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    toast.info("Reminder deleted");
  };
  
  const dismissReminder = (id: string) => {
    // Stop audio alarm
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    
    // Find the reminder
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;
    
    // Add to history
    const historyEntry = {
      id: reminder.id,
      medicineName: reminder.medicineName,
      dosage: reminder.dosage,
      timestamp: new Date().toISOString(),
      status: "taken" as const
    };
    
    setReminderHistory(prev => [historyEntry, ...prev]);
    
    // Update reminder status
    setReminders(prev => 
      prev.map(r => r.id === id ? { ...r, isActive: false, lastTaken: new Date().toISOString() } : r)
    );
    
    // Update current supply if refill tracking is enabled
    if (reminder.refillTracking && reminder.currentSupply !== undefined && reminder.currentSupply > 0) {
      const newSupply = reminder.currentSupply - 1;
      const updatedReminder = { 
        ...reminder, 
        currentSupply: newSupply,
        isActive: false, 
        lastTaken: new Date().toISOString() 
      };
      
      // Alert if supply is at or below alert threshold
      if (reminder.alertAt !== undefined && newSupply <= reminder.alertAt) {
        toast.warning(`Low supply alert: ${reminder.medicineName} has only ${newSupply} units left`, {
          duration: 6000
        });
      }
      
      updateReminder(updatedReminder);
    } else {
      toast.success("Reminder marked as taken");
    }
  };
  
  const snoozeReminder = (id: string, minutes: number) => {
    // Stop audio for now
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    
    // Get the reminder
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;
    
    // Add to history
    const historyEntry = {
      id: reminder.id,
      medicineName: reminder.medicineName,
      dosage: reminder.dosage,
      timestamp: new Date().toISOString(),
      status: "snoozed" as const
    };
    
    setReminderHistory(prev => [historyEntry, ...prev]);
    
    // Create a snoozed version with new time
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const snoozeHours = now.getHours().toString().padStart(2, '0');
    const snoozeMinutes = now.getMinutes().toString().padStart(2, '0');
    const snoozeTime = `${snoozeHours}:${snoozeMinutes}`;
    
    const snoozedReminder: Reminder = {
      ...reminder,
      isActive: true,
      time: snoozeTime,
    };
    
    updateReminder(snoozedReminder);
    toast.info(`Reminder snoozed for ${minutes} minutes`);
  };

  // Get reminders for a specific date
  const getRemindersForDate = (date: Date) => {
    // Format date to YYYY-MM-DD for comparison
    const formattedDate = date.toISOString().split('T')[0];
    
    return reminders.filter(reminder => {
      // Check if reminder applies to this date based on start date and duration
      const startDate = reminder.startDate ? new Date(reminder.startDate) : null;
      if (!startDate) return false; // If no start date, don't show on any days
      
      // Set time components to 0 for date comparison
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      
      const compareStartDate = new Date(startDate);
      compareStartDate.setHours(0, 0, 0, 0);
      
      // Check if date is on or after start date
      if (compareDate < compareStartDate) return false;
      
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
          
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + durationDays - 1);
          endDate.setHours(0, 0, 0, 0);
          
          // Check if date is on or before end date
          return compareDate <= endDate;
          
        case "weekly":
          // Check if it's the same day of week
          if (compareDate.getDay() !== compareStartDate.getDay()) return false;
          
          // Calculate the number of weeks since the start date
          const weekDiff = Math.floor((compareDate.getTime() - compareStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
          
          // If ongoing, we just need to verify it's the same day of week and on/after start date
          if (reminder.duration === "ongoing") return true;
          
          // For fixed duration weekly reminders, determine the number of occurrences
          let occurrences = 0;
          if (reminder.duration === "7days") occurrences = 1; // 1 week
          else if (reminder.duration === "14days") occurrences = 2; // 2 weeks
          else if (reminder.duration === "30days") occurrences = 4; // ~4 weeks
          else if (reminder.duration === "90days") occurrences = 12; // ~12 weeks
          else if (reminder.duration === "custom" && reminder.customDuration) {
            // For custom duration, calculate the number of weeks
            occurrences = Math.ceil(reminder.customDuration / 7);
          }
          
          // Check if the week difference is within the number of occurrences
          return weekDiff >= 0 && weekDiff < occurrences;
          
        case "monthly":
          // Check if it's the same day of month
          if (compareDate.getDate() !== compareStartDate.getDate()) return false;
          
          // Calculate the number of months since the start date
          const monthDiff = 
            (compareDate.getFullYear() - compareStartDate.getFullYear()) * 12 + 
            (compareDate.getMonth() - compareStartDate.getMonth());
          
          // If ongoing, we just need to verify it's the same day of month and on/after start date
          if (reminder.duration === "ongoing") return true;
          
          // For fixed duration monthly reminders, determine the number of occurrences
          let monthOccurrences = 0;
          if (reminder.duration === "30days") monthOccurrences = 1; // ~1 month
          else if (reminder.duration === "90days") monthOccurrences = 3; // ~3 months
          else if (reminder.duration === "custom" && reminder.customDuration) {
            // For custom duration, calculate the number of months (approximate)
            monthOccurrences = Math.ceil(reminder.customDuration / 30);
          }
          
          // Check if the month difference is within the number of occurrences
          return monthDiff >= 0 && monthDiff < monthOccurrences;
          
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
          
          const durEndDate = new Date(startDate);
          durEndDate.setDate(startDate.getDate() + durDays - 1);
          durEndDate.setHours(0, 0, 0, 0);
          
          return compareDate <= durEndDate;
          
        case "once":
          // For one-time reminders, only show on the start date
          return (
            compareDate.getFullYear() === compareStartDate.getFullYear() &&
            compareDate.getMonth() === compareStartDate.getMonth() &&
            compareDate.getDate() === compareStartDate.getDate()
          );
          
        case "as_needed":
          // As needed reminders don't have specific schedule
          return false;
          
        default:
          return false;
      }
    });
  };
  
  // Get reminders with refill tracking enabled
  const getRefillReminders = () => {
    return reminders.filter(reminder => reminder.refillTracking === true);
  };
  
  return (
    <ReminderContext.Provider 
      value={{ 
        reminders, 
        addReminder, 
        updateReminder, 
        deleteReminder,
        dismissReminder,
        snoozeReminder,
        getReminderById,
        reminderHistory,
        getRemindersForDate,
        getRefillReminders
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminders = () => useContext(ReminderContext);
