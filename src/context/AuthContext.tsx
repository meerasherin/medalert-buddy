
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AuthProvider: Setting up auth state listener");
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session);
        if (session) {
          // Get user data from session
          const userData: User = {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata.name || session.user.email?.split("@")[0] || ""
          };
          setUser(userData);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Check for initial session
    const initializeAuth = async () => {
      try {
        console.log("AuthProvider: Checking for initial session");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata.name || session.user.email?.split("@")[0] || ""
          };
          setUser(userData);
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) {
        console.error("Registration error:", error.message);
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        toast.success("Registration successful! Please sign in with your new account.");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration");
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Login error:", error.message);
        toast.error(error.message || "Invalid email or password");
        return false;
      }

      if (data.user) {
        // Request notification permission after successful login
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            toast.success('Notifications enabled!');
          } else {
            toast.warning('Notifications disabled. You may miss your medicine reminders.');
          }
        }
        
        navigate("/");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error.message);
        toast.error(error.message);
        return;
      }
      
      setUser(null);
      toast.info("You have been signed out");
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
