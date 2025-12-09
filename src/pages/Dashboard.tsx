
import React, { useState } from "react";
import Layout from "@/components/Layout";
import ReminderList from "@/components/ReminderList";
import ReminderForm from "@/components/ReminderForm";
import MedicineSearch from "@/components/MedicineSearch";
import ReminderHistory from "@/components/ReminderHistory";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Reminder, Medicine } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const [currentTab, setCurrentTab] = useState("reminders");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const isMobile = useIsMobile();

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    // Reset forms when switching tabs
    setShowAddForm(false);
    setEditingReminder(null);
  };

  const handleSelectMedicine = (medicine: Medicine) => {
    // Switch to reminders tab and open form with selected medicine
    setCurrentTab("reminders");
    setEditingReminder(null);
    setShowAddForm(true);
    // The selected medicine will be available in the form through props
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setShowAddForm(true);
  };

  const handleCancelForm = () => {
    setEditingReminder(null);
    setShowAddForm(false);
  };

  return (
    <Layout currentTab={currentTab} onChangeTab={handleTabChange}>
      {/* Reminders Tab */}
      {currentTab === "reminders" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl md:text-2xl font-bold">Your Medication Reminders</h1>
            {!showAddForm && (
              <Button 
                onClick={() => setShowAddForm(true)} 
                className="text-sm md:text-base whitespace-nowrap"
                size={isMobile ? "sm" : "default"}
              >
                <Plus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" /> Add Reminder
              </Button>
            )}
          </div>

          {showAddForm ? (
            <ReminderForm 
              editingReminder={editingReminder}
              onCancel={handleCancelForm}
            />
          ) : (
            <ReminderList onEditReminder={handleEditReminder} />
          )}
        </div>
      )}

      {/* Medicines Tab */}
      {currentTab === "medicines" && (
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-4">Medicine Database</h1>
          <MedicineSearch onSelectMedicine={handleSelectMedicine} />
        </div>
      )}

      {/* History Tab */}
      {currentTab === "history" && (
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-4">Medication History</h1>
          <ReminderHistory />
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
