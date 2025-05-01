import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Eye, EyeOff, Users, Building2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { SocialLoginButtons } from "@/components/ui/social-login-buttons";

// Define Lighthouse color theme
const colors = {
  navy: "#172445",
  blue: "#0b4d83",
  cream: "#f5f1dd",
  sand: "#d9c087",
  taupe: "#c6bcb6",
  lightBlue: "#3a7ca5",
  gold: "#e6c555",
  softCream: "#fcf9ee",
  darkTaupe: "#a99e94",
};

// Create schemas for login and registration
const loginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = insertUserSchema
  .extend({
    confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [showWelcome, setShowWelcome] = useState(true);

  // Redirect to appropriate dashboard based on role if already logged in
  useEffect(() => {
    if (user) {
      // If user is admin, redirect to admin dashboard, otherwise to employee dashboard
      if (user.role === "Admin") {
        setLocation("/admin");
      } else {
        setLocation("/");
      }
    }
  }, [user, setLocation]);

  // Show welcome animation on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Setup login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Setup registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      role: "User",
    },
  });

  async function onLoginSubmit(data: LoginFormValues) {
    try {
      await loginMutation.mutateAsync(data);
      toast({
        title: "Login successful",
        description: "Welcome back! You are now logged in.",
        variant: "default",
      });
    } catch (error) {
      // Error toast is automatically shown by the mutation error handler
    }
  }

  async function onRegisterSubmit(data: RegisterFormValues) {
    try {
      // Remove confirmPassword before submitting
      const { confirmPassword, ...registrationData } = data;
      await registerMutation.mutateAsync(registrationData);
      toast({
        title: "Registration successful",
        description: "Your account has been created. You are now logged in.",
        variant: "default",
      });
    } catch (error) {
      // Error toast is automatically shown by the mutation error handler
    }
  }
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy to-blue overflow-auto">
      {/* Welcome animation overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center text-white"
            >
              <motion.h1 
                className="text-5xl font-bold mb-4"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
              >
                Welcome to WorkTrack
              </motion.h1>
              <motion.p
                className="text-xl opacity-90"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3 }}
              >
                by Lighthouse
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col md:flex-row">
          {/* Left panel - Info section */}
          <div className="bg-navy text-white p-8 md:w-1/2 relative">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-1 relative pb-3">
                WorkTrack
                <span className="absolute bottom-0 left-0 w-16 h-1 bg-gold"></span>
              </h2>
              <p className="text-lg font-light">by Lighthouse</p>
            </div>
            
            <h3 className="text-2xl font-light mb-2">Welcome to Solaire Manpower Services</h3>
            <p className="text-white/90 mb-8">
              Log in to access your personalized dashboard and manage your workforce efficiently.
            </p>

            <div className="space-y-6 mt-10">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <Users className="w-5 h-5" />
                </div>
                <span>Staff Management</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <Building2 className="w-5 h-5" />
                </div>
                <span>Resource Planning</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span>Performance Tracking</span>
              </div>
            </div>

            <div className="absolute bottom-6 left-8 text-xs opacity-70">
              <div className="flex items-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M20 8.04L12 2L4 8.04M20 8.04V20H4V8.04"/>
                  <path d="M15 14a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                </svg>
                <span>Developed by Lighthouse</span>
              </div>
              <div className="text-xs">Guiding your digital transformation</div>
            </div>
          </div>

          {/* Right panel - Forms */}
          <div className="p-8 md:w-1/2 bg-soft-cream">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-navy">
                {activeTab === "login" ? "Login to Your Account" : "Create New Account"}
              </h1>
            </div>

            <div className="w-full">
              <Tabs defaultValue="login" className="w-full" onValueChange={handleTabChange}>
                <TabsList className="hidden">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                {/* Login Form */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: activeTab === "login" ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: activeTab === "login" ? 20 : -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeTab === "login" && (
                      <TabsContent value="login">
                        <Form {...loginForm}>
                          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                            <FormField
                              control={loginForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your username" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={loginForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <div className="relative">
                                    <FormControl>
                                      <Input 
                                        type={showLoginPassword ? "text" : "password"} 
                                        placeholder="Enter your password" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    >
                                      {showLoginPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                      ) : (
                                        <Eye className="h-4 w-4 text-gray-500" />
                                      )}
                                    </Button>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox id="showLoginPassword" 
                                  checked={showLoginPassword}
                                  onCheckedChange={() => setShowLoginPassword(!showLoginPassword)}
                                />
                                <label
                                  htmlFor="showLoginPassword"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Show password
                                </label>
                              </div>
                              <Button variant="link" className="px-0 text-sm text-blue">
                                Forgot password?
                              </Button>
                            </div>
                            <Button 
                              type="submit" 
                              className="w-full bg-blue hover:bg-navy text-white py-3 mt-6" 
                              disabled={loginMutation.isPending}
                            >
                              {loginMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Logging in...
                                </>
                              ) : (
                                "Login"
                              )}
                            </Button>
                            
                            <div className="mt-8 relative">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-300"></span>
                              </div>
                              <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-soft-cream px-2 text-gray-500">
                                  Or continue with
                                </span>
                              </div>
                            </div>
                            
                            <SocialLoginButtons 
                              onLogin={(provider) => {
                                toast({
                                  title: `${provider} Login Coming Soon`,
                                  description: `Login with ${provider} will be available soon.`,
                                  variant: "default",
                                });
                              }}
                              className="mt-6" 
                            />
                            
                            <div className="text-center mt-4">
                              <span className="text-sm text-gray-600">
                                Don't have an account? {" "}
                                <button
                                  type="button"
                                  className="text-blue font-medium hover:underline"
                                  onClick={() => setActiveTab("register")}
                                >
                                  Register here
                                </button>
                              </span>
                            </div>
                          </form>
                        </Form>
                      </TabsContent>
                    )}
                  
                    {/* Registration Form */}
                    {activeTab === "register" && (
                      <TabsContent value="register">
                        <Form {...registerForm}>
                          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={registerForm.control}
                                name="firstName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="First name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={registerForm.control}
                                name="lastName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Last name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={registerForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Choose a username" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="Enter your email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <div className="relative">
                                    <FormControl>
                                      <Input 
                                        type={showRegisterPassword ? "text" : "password"} 
                                        placeholder="Create a password" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    >
                                      {showRegisterPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                      ) : (
                                        <Eye className="h-4 w-4 text-gray-500" />
                                      )}
                                    </Button>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm Password</FormLabel>
                                  <div className="relative">
                                    <FormControl>
                                      <Input 
                                        type={showRegisterConfirmPassword ? "text" : "password"} 
                                        placeholder="Confirm your password" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    >
                                      {showRegisterConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                      ) : (
                                        <Eye className="h-4 w-4 text-gray-500" />
                                      )}
                                    </Button>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex items-center space-x-2">
                              <Checkbox id="terms" />
                              <label
                                htmlFor="terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                I agree to the{" "}
                                <Link href="/terms-and-conditions" className="text-blue hover:underline">
                                  Terms and Conditions
                                </Link>
                              </label>
                            </div>
                            <Button 
                              type="submit" 
                              className="w-full bg-blue hover:bg-navy text-white py-3 mt-4" 
                              disabled={registerMutation.isPending}
                            >
                              {registerMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Creating account...
                                </>
                              ) : (
                                "Register"
                              )}
                            </Button>
                            
                            <div className="text-center mt-4">
                              <span className="text-sm text-gray-600">
                                Already have an account? {" "}
                                <button
                                  type="button"
                                  className="text-blue font-medium hover:underline"
                                  onClick={() => setActiveTab("login")}
                                >
                                  Login here
                                </button>
                              </span>
                            </div>
                          </form>
                        </Form>
                      </TabsContent>
                    )}
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-3 text-center text-xs text-white/70 absolute bottom-0 w-full">
        <div className="flex justify-center items-center gap-3">
          <span>© {new Date().getFullYear()} Solaire Manpower Services</span>
          <Link href="/terms-and-conditions" className="hover:text-white hover:underline">Terms of Service</Link>
          <Link href="/privacy-policy" className="hover:text-white hover:underline">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}