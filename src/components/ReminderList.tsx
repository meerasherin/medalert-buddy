
import React, { useState, useEffect } from "react";
import { useReminders } from "@/context/ReminderContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reminder } from "@/types";
import { Edit, Trash, Bell, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const ReminderItem = ({ reminder, onEdit }: { reminder: Reminder, onEdit: (reminder: Reminder) => void }) => {
  const { deleteReminder, dismissReminder, snoozeReminder } = useReminders();
  const [activeNotification, setActiveNotification] = useState<boolean>(reminder.isActive);
  const [snoozeModalOpen, setSnoozeModalOpen] = useState<boolean>(false);
  const [snoozeTime, setSnoozeTime] = useState<number>(10);

  // Stay in sync with the reminder's active state
  useEffect(() => {
    setActiveNotification(reminder.isActive);
  }, [reminder.isActive]);

  const handleDismiss = () => {
    dismissReminder(reminder.id);
    setActiveNotification(false);
  };

  const handleSnooze = () => {
    snoozeReminder(reminder.id, snoozeTime);
    setSnoozeModalOpen(false);
    setActiveNotification(false);
  };

  return (
    <Card className={`mb-4 shadow-sm transition-all ${activeNotification ? 'border-mymed-500 shadow-mymed-100' : ''}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{reminder.medicineName}</h3>
            <p className="text-muted-foreground text-sm">{reminder.dosage}</p>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{reminder.time}</span>
              <Badge variant={reminder.frequency === 'daily' ? 'default' : 'outline'} className="ml-2">
                {reminder.frequency}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {activeNotification && (
              <div className="flex flex-col gap-2">
                <Button 
                  size="sm" 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleDismiss}
                >
                  Take Now
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSnoozeModalOpen(true)}
                >
                  Snooze
                </Button>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Button size="icon" variant="ghost" onClick={() => onEdit(reminder)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => deleteReminder(reminder.id)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {activeNotification && (
          <div className="mt-2 relative">
            <div className="flex items-center gap-2 py-2 px-3 bg-mymed-100 rounded-md">
              <div className="relative">
                <Bell className="h-5 w-5 text-mymed-600" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-mymed-600 rounded-full pulse-animation"></span>
              </div>
              <span className="text-sm font-medium text-mymed-800">
                Time to take your medicine
              </span>
            </div>
          </div>
        )}
      </CardContent>
      
      <Dialog open={snoozeModalOpen} onOpenChange={setSnoozeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Snooze Reminder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={String(snoozeTime)} onValueChange={(v) => setSnoozeTime(Number(v))}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="r1" />
                <Label htmlFor="r1">5 minutes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="10" id="r2" />
                <Label htmlFor="r2">10 minutes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="15" id="r3" />
                <Label htmlFor="r3">15 minutes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30" id="r4" />
                <Label htmlFor="r4">30 minutes</Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSnoozeModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSnooze}>Snooze</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const ReminderList = ({ onEditReminder }: { onEditReminder: (reminder: Reminder) => void }) => {
  const { reminders } = useReminders();
  
  if (reminders.length === 0) {
    return (
      <Card className="w-full mt-4">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No reminders set yet. Add your first medicine reminder to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <h2 className="text-xl font-semibold">Your Reminders</h2>
      {reminders.map((reminder) => (
        <ReminderItem 
          key={reminder.id} 
          reminder={reminder} 
          onEdit={onEditReminder} 
        />
      ))}
    </div>
  );
};

export default ReminderList;
