
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Bell, LogOut, Menu, Clock, X, Calendar,
  Pill, User, Weight 
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReminders } from "@/context/ReminderContext";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onChangeTab?: (tab: string) => void;
}

const Layout = ({ children, currentTab, onChangeTab = () => {} }: LayoutProps) => {
  const { logout, user } = useAuth();
  const { reminders } = useReminders();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const activeRemindersCount = reminders.filter(r => r.isActive).length;

  const handleTabChange = (value: string) => {
    if (value === "calendar") {
      navigate("/calendar");
    } else if (value === "refill") {
      navigate("/refill");
    } else if (value === "weight") {
      navigate("/weight");
    } else if (value === "reminders" || value === "medicines" || value === "history") {
      navigate("/");
      if (onChangeTab) {
        onChangeTab(value);
      }
    } else {
      if (onChangeTab) {
        onChangeTab(value);
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex flex-1 items-center justify-between">
            {/* App Name */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-mymed-900 cursor-pointer" onClick={() => navigate("/")}>MyMed</span>
            </div>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Tabs value={currentTab} className="w-fit" onValueChange={handleTabChange}>
                <TabsList>
                  <TabsTrigger value="reminders">
                    Reminders
                    {activeRemindersCount > 0 && (
                      <span className="ml-2 bg-mymed-600 text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">
                        {activeRemindersCount}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="medicines">
                    Medicines
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    History
                  </TabsTrigger>
                  <TabsTrigger value="calendar">
                    Calendar
                  </TabsTrigger>
                  <TabsTrigger value="refill">
                    Refill Tracker
                  </TabsTrigger>
                  <TabsTrigger value="weight">
                    Weight Tracker
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={logout} className="rounded-full">
                <LogOut className="h-5 w-5" />
              </Button>

              {/* Mobile Menu Toggle */}
              {isMobile && (
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>MyMed</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-2">
                      <Button
                        variant={currentTab === "reminders" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleTabChange("reminders")}
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Reminders
                        {activeRemindersCount > 0 && (
                          <span className="ml-2 bg-background text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">
                            {activeRemindersCount}
                          </span>
                        )}
                      </Button>
                      <Button
                        variant={currentTab === "medicines" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleTabChange("medicines")}
                      >
                        <Pill className="mr-2 h-4 w-4" />
                        Medicines
                      </Button>
                      <Button
                        variant={currentTab === "history" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleTabChange("history")}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        History
                      </Button>
                      <Button
                        variant={currentTab === "calendar" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleTabChange("calendar")}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Calendar
                      </Button>
                      <Button
                        variant={currentTab === "refill" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleTabChange("refill")}
                      >
                        <Pill className="mr-2 h-4 w-4" />
                        Refill Tracker
                      </Button>
                      <Button
                        variant={currentTab === "weight" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleTabChange("weight")}
                      >
                        <Weight className="mr-2 h-4 w-4" />
                        Weight Tracker
                      </Button>
                      
                      <div className="pt-4 mt-4 border-t">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4" />
                          <span className="text-sm font-medium">{user?.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={logout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">{children}</main>
    </div>
  );
};

export default Layout;
