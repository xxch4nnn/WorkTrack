import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, User, Building, Clock, Receipt, ChevronRight, ChevronLeft } from "lucide-react";

const steps = [
  {
    id: "welcome",
    title: "Welcome to WorkTrack",
    description: "Let's get you set up with our system. This will only take a minute.",
    icon: <CheckCircle2 className="h-8 w-8 text-primary" />,
  },
  {
    id: "profile",
    title: "Your Profile",
    description: "Review and complete your profile information.",
    icon: <User className="h-8 w-8 text-primary" />,
  },
  {
    id: "company",
    title: "Company Information",
    description: "Confirm your company and department details.",
    icon: <Building className="h-8 w-8 text-primary" />,
  },
  {
    id: "dtr",
    title: "Daily Time Record",
    description: "Learn how to submit your time records.",
    icon: <Clock className="h-8 w-8 text-primary" />,
  },
  {
    id: "payroll",
    title: "Payroll System",
    description: "Understand how your payroll is processed.",
    icon: <Receipt className="h-8 w-8 text-primary" />,
  },
  {
    id: "completed",
    title: "All Set!",
    description: "You're ready to use WorkTrack!",
    icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
  },
];

const Onboarding = () => {
  const { user, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState(0);
  
  const progress = ((currentStep + 1) / steps.length) * 100;
  
  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);
  
  const goToNextStep = () => {
    if (currentStep < steps.length - 1 && !isAnimating) {
      setDirection(1);
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    } else if (currentStep === steps.length - 1) {
      // Last step completed, redirect based on role
      if (isAdmin) {
        setLocation("/admin");
      } else {
        setLocation("/");
      }
      
      toast({
        title: "Onboarding Completed",
        description: "Welcome to WorkTrack! You're all set to start.",
      });
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0 && !isAnimating) {
      setDirection(-1);
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };
  
  // If there's no user, don't render anything (will redirect to auth)
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              WorkTrack Onboarding
            </span>
          </CardTitle>
          <CardDescription>
            Step {currentStep + 1} of {steps.length}
          </CardDescription>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        
        <CardContent className="pb-6">
          <div className="min-h-[350px] flex flex-col justify-center relative overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentStep}
                initial={{ 
                  opacity: 0, 
                  x: direction > 0 ? 100 : -100 
                }}
                animate={{ 
                  opacity: 1, 
                  x: 0 
                }}
                exit={{ 
                  opacity: 0, 
                  x: direction > 0 ? -100 : 100 
                }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="mb-6">
                  {steps[currentStep].icon}
                </div>
                <h2 className="text-2xl font-bold mb-4">
                  {steps[currentStep].title}
                </h2>
                <p className="text-gray-600 mb-8 max-w-md">
                  {steps[currentStep].description}
                </p>

                {currentStep === 0 && (
                  <div className="space-y-4 w-full max-w-md">
                    <div className="p-4 bg-blue-50 rounded-lg text-blue-800">
                      <p className="font-medium">Welcome to WorkTrack, {user.firstName}!</p>
                      <p className="text-sm">We'll guide you through the key features of our system.</p>
                    </div>
                    <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                      <div className="bg-primary rounded-full p-2 mr-3">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Your Account</p>
                        <p className="text-xs text-gray-500">Logged in as: {user.firstName} {user.lastName}</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4 w-full max-w-md">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-sm mb-2">Your Profile Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Name:</span>
                          <span className="font-medium">{user.firstName} {user.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Email:</span>
                          <span className="font-medium">{user.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Role:</span>
                          <span className="font-medium">{user.role}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span className="font-medium text-green-600">{user.status}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-blue-600">You can update your profile information in the Settings page later.</p>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4 w-full max-w-md">
                    <div className="flex items-center justify-center mb-2">
                      <Building className="h-16 w-16 text-primary opacity-20" />
                    </div>
                    <h3 className="font-medium text-lg mb-2">Company Information</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      You are registered with the following company:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Company:</span>
                          <span className="font-medium">WorkTrack Solutions Inc.</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Department:</span>
                          <span className="font-medium">Technology</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Position:</span>
                          <span className="font-medium">Software Engineer</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4 w-full max-w-md">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-16 w-16 text-primary opacity-20" />
                    </div>
                    <h3 className="font-medium text-lg">Daily Time Records</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      You have two ways to log your daily time records:
                    </p>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg flex items-start">
                        <div className="bg-primary rounded-full p-1.5 mr-3 mt-0.5">
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Clock In/Out Button</p>
                          <p className="text-xs text-gray-500">Use the Clock In/Out button on your dashboard to record your work hours in real-time.</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg flex items-start">
                        <div className="bg-primary rounded-full p-1.5 mr-3 mt-0.5">
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Upload DTR</p>
                          <p className="text-xs text-gray-500">Upload your company's DTR form, and our system will automatically process it.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4 w-full max-w-md">
                    <div className="flex items-center justify-center mb-2">
                      <Receipt className="h-16 w-16 text-primary opacity-20" />
                    </div>
                    <h3 className="font-medium text-lg">Payroll System</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Here's how the payroll process works:
                    </p>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg flex items-start">
                        <div className="bg-green-100 rounded-full p-2 mr-3 mt-0.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Submit DTRs</p>
                          <p className="text-xs text-gray-500">Your DTRs are collected and verified by your manager.</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg flex items-start">
                        <div className="bg-green-100 rounded-full p-2 mr-3 mt-0.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Payroll Processing</p>
                          <p className="text-xs text-gray-500">Hours are calculated along with any overtime, deductions, etc.</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg flex items-start">
                        <div className="bg-green-100 rounded-full p-2 mr-3 mt-0.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Payslip Generation</p>
                          <p className="text-xs text-gray-500">Your digital payslip becomes available in the Payroll section.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6 w-full max-w-md">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          className="absolute -right-1 -bottom-1 bg-blue-500 text-white rounded-full p-1.5"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </motion.div>
                      </div>
                    </div>
                    <h3 className="font-medium text-2xl text-green-600">You're All Set!</h3>
                    <p className="text-gray-600">
                      Thank you for completing the onboarding process. You're now ready to use WorkTrack to its full potential!
                    </p>
                    <div className="flex justify-center">
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => isAdmin ? setLocation("/admin") : setLocation("/")}
                      >
                        Go to Dashboard
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 0 || isAnimating}
            className={currentStep === 0 ? "opacity-0" : ""}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Button
            onClick={goToNextStep}
            disabled={isAnimating}
          >
            {currentStep === steps.length - 1 ? (
              "Finish"
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;