
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerSubmitting, setRegisterSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!loginEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (loginPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoginSubmitting(true);
    console.log("Attempting login with:", loginEmail);

    try {
      const success = await login(loginEmail, loginPassword);
      
      if (success) {
        toast.success("Signed in successfully!");
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to sign in. Please check your credentials.");
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!registerEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (registerPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setRegisterSubmitting(true);
    console.log("Attempting registration with:", registerEmail, registerName);

    try {
      const success = await register(registerName, registerEmail, registerPassword);
      
      if (success) {
        toast.success("Registration successful! You can now sign in.");
        setActiveTab("login");
        setLoginEmail(registerEmail);
        // Clear register form
        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to register. Please try again.");
    } finally {
      setRegisterSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mymed-50 to-mymed-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">MyMed</CardTitle>
          <CardDescription className="text-center">Your personal medicine reminder</CardDescription>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="pl-10"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={loginSubmitting}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={loginSubmitting}
                      autoComplete="current-password"
                    />
                    <button 
                      type="button"
                      className="absolute right-2.5 top-2.5"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-mymed-600 hover:bg-mymed-700"
                  disabled={loginSubmitting}
                >
                  {loginSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-10"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      disabled={registerSubmitting}
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="pl-10"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      disabled={registerSubmitting}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      disabled={registerSubmitting}
                      autoComplete="new-password"
                    />
                    <button 
                      type="button"
                      className="absolute right-2.5 top-2.5"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-mymed-600 hover:bg-mymed-700"
                  disabled={registerSubmitting}
                >
                  {registerSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
};

export default Auth;
