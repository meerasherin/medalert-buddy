
import React from 'react';
import Layout from "@/components/Layout";
import { useReminders } from "@/context/ReminderContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const RefillTracker = () => {
  const { getRefillReminders, updateReminder } = useReminders();
  const refillReminders = getRefillReminders();
  
  const handleRefill = (reminder: any, amount: number) => {
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    const newSupply = (reminder.currentSupply || 0) + amount;
    const updatedReminder = {
      ...reminder,
      currentSupply: newSupply
    };
    
    updateReminder(updatedReminder);
    toast.success(`Refilled ${reminder.medicineName} with ${amount} units`);
  };

  return (
    <Layout currentTab="refill" onChangeTab={() => {}}>
      <h1 className="text-xl md:text-2xl font-bold mb-4">Refill Tracker</h1>
      
      {refillReminders.length > 0 ? (
        <div className="space-y-4">
          {refillReminders.map((reminder) => {
            const currentSupply = reminder.currentSupply || 0;
            const alertAt = reminder.alertAt || 0;
            const percentage = alertAt > 0 ? Math.min(100, (currentSupply / alertAt) * 30) : 100;
            const isLow = currentSupply <= alertAt;
            
            return (
              <Card key={reminder.id} className="overflow-hidden">
                <div className={`h-2 ${isLow ? 'bg-red-500' : 'bg-green-500'}`} />
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-4 h-12 rounded-full mt-1" 
                        style={{ 
                          backgroundColor: isLow ? '#f87171' : '#4ade80',
                        }}
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{reminder.medicineName}</h3>
                        <p className="text-muted-foreground text-sm">{reminder.dosage}</p>
                        
                        <div className="mt-3 grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-1">Current Supply</div>
                            <Badge variant={isLow ? "destructive" : "outline"} className="text-base py-1 px-2">
                              {currentSupply} units
                            </Badge>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium mb-1">Alert Threshold</div>
                            <Badge variant="secondary" className="text-base py-1 px-2">
                              {alertAt} units
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <Progress value={percentage} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{isLow ? 'Low supply' : 'Good supply'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <RefillForm reminder={reminder} onRefill={handleRefill} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            No medicines with refill tracking enabled. 
            Add a medicine with refill tracking to see it here.
          </p>
        </Card>
      )}
    </Layout>
  );
};

const RefillForm = ({ reminder, onRefill }: { reminder: any, onRefill: (reminder: any, amount: number) => void }) => {
  const [amount, setAmount] = React.useState(30);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRefill(reminder, amount);
    setAmount(30); // Reset to default
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2 bg-gray-50 p-3 rounded-md">
      <div className="text-sm font-medium text-center mb-1">Record Refill</div>
      <Input
        type="number"
        min="1"
        className="w-24 text-right"
        value={amount}
        onChange={(e) => setAmount(parseInt(e.target.value))}
      />
      <Button type="submit" size="sm" className="w-full">
        Add to Supply
      </Button>
    </form>
  );
};

export default RefillTracker;
