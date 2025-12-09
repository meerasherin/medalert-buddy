
import React, { useState, useEffect } from "react";
import { useReminders } from "@/context/ReminderContext";
import { medicines } from "@/data/medicines";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimePicker } from "@/components/ui/time-picker";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Reminder } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReminderFormProps {
  editingReminder?: Reminder | null;
  onCancel: () => void;
}

const ReminderForm = ({ editingReminder, onCancel }: ReminderFormProps) => {
  const { addReminder, updateReminder } = useReminders();
  
  // Form state
  const [medicineId, setMedicineId] = useState(editingReminder?.medicineId || "");
  const [medicineName, setMedicineName] = useState(editingReminder?.medicineName || "");
  const [dosage, setDosage] = useState(editingReminder?.dosage || "");
  const [frequency, setFrequency] = useState(editingReminder?.frequency || "daily");
  const [duration, setDuration] = useState(editingReminder?.duration || "ongoing");
  const [customDuration, setCustomDuration] = useState(editingReminder?.customDuration || 30);
  const [startDate, setStartDate] = useState<Date>(
    editingReminder?.startDate ? new Date(editingReminder.startDate) : new Date()
  );
  const [time, setTime] = useState<Date | undefined>(
    editingReminder?.time 
      ? (() => {
          const [hours, minutes] = editingReminder.time.split(':').map(Number);
          const date = new Date();
          date.setHours(hours, minutes, 0, 0);
          return date;
        })()
      : new Date()
  );
  const [refillTracking, setRefillTracking] = useState(editingReminder?.refillTracking || false);
  const [currentSupply, setCurrentSupply] = useState(editingReminder?.currentSupply || 30);
  const [alertAt, setAlertAt] = useState(editingReminder?.alertAt || 5);
  const [alertError, setAlertError] = useState<string | null>(null);
  
  // Validate alert threshold whenever current supply or alert threshold changes
  useEffect(() => {
    if (alertAt > currentSupply) {
      setAlertError("Alert threshold must be less than or equal to current supply");
    } else {
      setAlertError(null);
    }
  }, [currentSupply, alertAt]);
  
  // Handle medicine selection
  const handleMedicineSelect = (id: string) => {
    setMedicineId(id);
    if (id !== "custom") {
      const selectedMedicine = medicines.find(med => med.id === id);
      if (selectedMedicine) {
        setMedicineName(selectedMedicine.name);
      }
    }
  };

  // Format time for display and storage
  const getTimeString = () => {
    if (!time) return "08:00";
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!medicineName.trim()) {
      toast.error("Please enter a medicine name");
      return;
    }
    
    if (!dosage.trim()) {
      toast.error("Please enter a dosage");
      return;
    }
    
    if (refillTracking && alertAt > currentSupply) {
      toast.error("Alert threshold must be less than or equal to current supply");
      return;
    }
    
    // Get duration value based on selection
    let durationValue: number | "ongoing" = "ongoing";
    if (duration === "7days") durationValue = 7;
    else if (duration === "14days") durationValue = 14;
    else if (duration === "30days") durationValue = 30;
    else if (duration === "90days") durationValue = 90;
    else if (duration === "custom") durationValue = customDuration;
    
    const reminderData = {
      medicineId,
      medicineName,
      dosage,
      time: getTimeString(),
      frequency,
      refillTracking,
      currentSupply: refillTracking ? currentSupply : undefined,
      alertAt: refillTracking ? alertAt : undefined,
      startDate: startDate.toISOString(),
      duration: duration,
      customDuration: duration === "custom" ? customDuration : undefined,
    };
    
    if (editingReminder) {
      updateReminder({
        ...editingReminder,
        ...reminderData,
      });
      toast.success("Reminder updated successfully");
    } else {
      addReminder(reminderData);
      toast.success("Reminder added successfully");
    }
    
    onCancel();
  };
  
  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold flex items-center mb-4">
        <Clock className="mr-2 h-6 w-6 text-mymed-600" />
        {editingReminder ? "Edit Reminder" : "Add New Reminder"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="medicine">Medicine</Label>
          <Select 
            value={medicineId || "custom"} 
            onValueChange={handleMedicineSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a medicine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom medicine</SelectItem>
              {medicines.map(medicine => (
                <SelectItem key={medicine.id} value={medicine.id}>
                  {medicine.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="medicineName">Medicine Name</Label>
          <Input
            id="medicineName"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
            placeholder="Enter medicine name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dosage">Dosage</Label>
          <Input
            id="dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="e.g., 1 pill, 5ml, etc."
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {["08:00", "12:00", "18:00", "21:00"].map((t) => {
              const [hours, minutes] = t.split(':').map(Number);
              const timeDate = new Date();
              timeDate.setHours(hours, minutes, 0, 0);
              const currentTimeStr = time ? `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}` : "";
              
              return (
                <Button 
                  key={t}
                  type="button"
                  variant={currentTimeStr === t ? "default" : "outline"}
                  onClick={() => setTime(timeDate)}
                  className="text-sm"
                >
                  {t}
                </Button>
              );
            })}
          </div>
          
          <TimePicker date={time} setDate={setTime} className="w-full" />
        </div>
        
        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select 
            value={frequency} 
            onValueChange={setFrequency}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="twice_daily">Twice Daily</SelectItem>
              <SelectItem value="every_morning">Every Morning</SelectItem>
              <SelectItem value="every_evening">Every Evening</SelectItem>
              <SelectItem value="every_8h">Every 8 Hours</SelectItem>
              <SelectItem value="every_12h">Every 12 Hours</SelectItem>
              <SelectItem value="as_needed">As Needed</SelectItem>
              <SelectItem value="once">One-time Only</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>For how long?</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button 
              type="button"
              variant={duration === "7days" ? "default" : "outline"}
              onClick={() => setDuration("7days")}
              className="text-sm"
            >
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold">7</span>
                <span className="text-xs">7 days</span>
              </div>
            </Button>
            <Button 
              type="button"
              variant={duration === "14days" ? "default" : "outline"}
              onClick={() => setDuration("14days")}
              className="text-sm"
            >
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold">14</span>
                <span className="text-xs">14 days</span>
              </div>
            </Button>
            <Button 
              type="button"
              variant={duration === "30days" ? "default" : "outline"}
              onClick={() => setDuration("30days")}
              className="text-sm"
            >
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold">30</span>
                <span className="text-xs">30 days</span>
              </div>
            </Button>
            <Button 
              type="button"
              variant={duration === "90days" ? "default" : "outline"}
              onClick={() => setDuration("90days")}
              className="text-sm"
            >
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold">90</span>
                <span className="text-xs">90 days</span>
              </div>
            </Button>
            <Button 
              type="button"
              variant={duration === "ongoing" ? "default" : "outline"}
              onClick={() => setDuration("ongoing")}
              className="text-sm"
            >
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold">∞</span>
                <span className="text-xs">Ongoing</span>
              </div>
            </Button>
            <Button 
              type="button"
              variant={duration === "custom" ? "default" : "outline"}
              onClick={() => setDuration("custom")}
              className="text-sm"
            >
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold">#</span>
                <span className="text-xs">Custom</span>
              </div>
            </Button>
          </div>
          
          {duration === "custom" && (
            <div className="mt-2">
              <Input
                type="number"
                min="1"
                value={customDuration}
                onChange={(e) => setCustomDuration(Number(e.target.value))}
                className="w-full"
                placeholder="Enter number of days"
              />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label>Starts</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label htmlFor="refill-tracking" className="text-base">
              Enable Refill Tracking
            </Label>
            <Switch
              id="refill-tracking"
              checked={refillTracking}
              onCheckedChange={setRefillTracking}
            />
          </div>
          
          {refillTracking && (
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-supply">Current Supply</Label>
                <Input
                  id="current-supply"
                  type="number"
                  min="0"
                  value={currentSupply}
                  onChange={(e) => setCurrentSupply(Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alert-at">
                  Alert me when supply reaches
                  {alertError && (
                    <span className="ml-1 text-sm text-red-500">{alertError}</span>
                  )}
                </Label>
                <Input
                  id="alert-at"
                  type="number"
                  min="0"
                  max={currentSupply}
                  value={alertAt}
                  onChange={(e) => setAlertAt(Number(e.target.value))}
                  className={alertError ? "border-red-300" : ""}
                />
                <p className="text-xs text-muted-foreground">
                  Must be less than or equal to your current supply ({currentSupply} units)
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={alertError !== null && refillTracking}>
            {editingReminder ? "Update Reminder" : "Add Reminder"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ReminderForm;
