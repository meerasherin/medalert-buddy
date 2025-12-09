
import React from "react";
import { useAuth } from "@/context/AuthContext";
import Auth from "./Auth";
import Dashboard from "./Dashboard";

const Index = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-mymed-300 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-mymed-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return user ? <Dashboard /> : <Auth />;
};

export default Index;
