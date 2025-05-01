import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQuery } from "@tanstack/react-query";
import { User, Badge, Lock, Mail, Shield, ClipboardList, Clock, Bell, Eye, EyeOff } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

// Personal info form schema
const personalInfoSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Password change schema
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;
type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/users/profile"],
    enabled: !!user,
  });

  // Fetch user settings
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
    enabled: !!user,
  });

  // Personal info form
  const personalInfoForm = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
    },
    values: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
    },
  });

  // Password change form
  const passwordChangeForm = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: PersonalInfoValues) => {
      const res = await apiRequest("PATCH", "/api/users/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordChangeValues) => {
      const res = await apiRequest("POST", "/api/users/change-password", data);
      return await res.json();
    },
    onSuccess: () => {
      passwordChangeForm.reset();
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update notification settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { key: string; value: boolean }) => {
      const res = await apiRequest("PATCH", "/api/settings", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings updated",
        description: "Your notification settings have been updated.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onPersonalInfoSubmit = (data: PersonalInfoValues) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordChangeSubmit = (data: PasswordChangeValues) => {
    changePasswordMutation.mutate(data);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    updateSettingsMutation.mutate({ key, value });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Card */}
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&size=100&background=random`} alt={user?.username} />
              <AvatarFallback className="text-2xl">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h3>
            <p className="text-gray-500">{user?.email}</p>
            <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {user?.role}
            </div>
            
            <div className="w-full mt-6 space-y-3">
              <div className="flex items-center p-3 rounded-md bg-gray-50">
                <Badge className="h-4 w-4 text-primary mr-2" />
                <span className="text-sm">ID: {user?.id}</span>
              </div>
              <div className="flex items-center p-3 rounded-md bg-gray-50">
                <Mail className="h-4 w-4 text-primary mr-2" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <div className="flex items-center p-3 rounded-md bg-gray-50">
                <User className="h-4 w-4 text-primary mr-2" />
                <span className="text-sm">Username: {user?.username}</span>
              </div>
              <div className="flex items-center p-3 rounded-md bg-gray-50">
                <Shield className="h-4 w-4 text-primary mr-2" />
                <span className="text-sm">Role: {user?.role}</span>
              </div>
              <div className="flex items-center p-3 rounded-md bg-gray-50">
                <ClipboardList className="h-4 w-4 text-primary mr-2" />
                <span className="text-sm">Status: {user?.status}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <div className="w-full md:w-2/3">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...personalInfoForm}>
                    <form onSubmit={personalInfoForm.handleSubmit(onPersonalInfoSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={personalInfoForm.control}
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
                          control={personalInfoForm.control}
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
                        control={personalInfoForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={personalInfoForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={personalInfoForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="mt-4"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Update your password and security preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordChangeForm}>
                    <form onSubmit={passwordChangeForm.handleSubmit(onPasswordChangeSubmit)} className="space-y-4">
                      <FormField
                        control={passwordChangeForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input 
                                  type={showCurrentPassword ? "text" : "password"} 
                                  placeholder="Enter your current password" 
                                  {...field} 
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              >
                                {showCurrentPassword ? (
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
                        control={passwordChangeForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input 
                                  type={showNewPassword ? "text" : "password"} 
                                  placeholder="Enter new password" 
                                  {...field} 
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                              </Button>
                            </div>
                            <FormMessage />
                            <FormDescription>
                              Password must be at least 6 characters long.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordChangeForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input 
                                  type={showConfirmPassword ? "text" : "password"} 
                                  placeholder="Confirm new password" 
                                  {...field} 
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              >
                                {showConfirmPassword ? (
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
                      <div className="pt-4">
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={changePasswordMutation.isPending}
                        >
                          {changePasswordMutation.isPending ? "Changing Password..." : "Change Password"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                  
                  <div className="mt-8 border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <Switch 
                        checked={settings?.twoFactorAuth || false}
                        onCheckedChange={(checked) => handleNotificationChange("twoFactorAuth", checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email_notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch 
                        id="email_notifications"
                        checked={settings?.emailNotifications || false}
                        onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="dtr_notifications">DTR Approval Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when your DTR is approved or rejected
                        </p>
                      </div>
                      <Switch 
                        id="dtr_notifications"
                        checked={settings?.dtrNotifications || false}
                        onCheckedChange={(checked) => handleNotificationChange("dtrNotifications", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="payroll_notifications">Payroll Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when a new payslip is available
                        </p>
                      </div>
                      <Switch 
                        id="payroll_notifications"
                        checked={settings?.payrollNotifications || false}
                        onCheckedChange={(checked) => handleNotificationChange("payrollNotifications", checked)}
                      />
                    </div>
                    
                    {user?.role === "Admin" && (
                      <>
                        <div className="pt-4 border-t">
                          <h3 className="text-lg font-medium mb-2">Admin Notifications</h3>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="new_dtr_notifications">New DTR Submissions</Label>
                            <p className="text-sm text-muted-foreground">
                              Get notified when employees submit new DTRs
                            </p>
                          </div>
                          <Switch 
                            id="new_dtr_notifications"
                            checked={settings?.newDtrNotifications || false}
                            onCheckedChange={(checked) => handleNotificationChange("newDtrNotifications", checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="auto_approve_dtr">Auto-Approve DTRs</Label>
                            <p className="text-sm text-muted-foreground">
                              Automatically approve DTRs that match known formats
                            </p>
                          </div>
                          <Switch 
                            id="auto_approve_dtr"
                            checked={settings?.autoApproveDTR || false}
                            onCheckedChange={(checked) => handleNotificationChange("autoApproveDTR", checked)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;