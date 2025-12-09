
import React from "react";
import { useReminders } from "@/context/ReminderContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, CheckIcon, Clock, XIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

const ReminderHistory = () => {
  const { reminderHistory } = useReminders();
  
  if (reminderHistory.length === 0) {
    return (
      <Card className="w-full mt-4">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No reminder history yet.</p>
        </CardContent>
      </Card>
    );
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "taken":
        return <CheckIcon className="h-4 w-4 text-green-500" />;
      case "missed":
        return <XIcon className="h-4 w-4 text-red-500" />;
      case "snoozed":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };
  
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "taken":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "missed":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "snoozed":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      default:
        return "";
    }
  };
  
  return (
    <div className="space-y-4 mt-4">
      <h2 className="text-xl font-semibold">Medication History</h2>
      <div className="space-y-3">
        {reminderHistory.map((entry, index) => (
          <Card key={`${entry.id}-${index}`} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{entry.medicineName}</h3>
                  <p className="text-muted-foreground text-sm">{entry.dosage}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {format(parseISO(entry.timestamp), "MMM d, yyyy h:mm a")}
                    </span>
                  </div>
                </div>
                <Badge className={`flex items-center gap-1 capitalize ${getStatusBadgeStyle(entry.status)}`}>
                  {getStatusIcon(entry.status)}
                  {entry.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReminderHistory;
