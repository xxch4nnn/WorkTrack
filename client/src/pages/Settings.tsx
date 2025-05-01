import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Upload, Clock, Bell, Shield, PaintBucket } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Brand settings schema
const brandingSchema = z.object({
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters" }),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Must be a valid hex color code (e.g. #0080FF)",
  }),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Must be a valid hex color code (e.g. #0080FF)",
  }),
  logo: z.string().optional(),
  favicon: z.string().optional(),
});

// Notification settings schema
const notificationSchema = z.object({
  emailNotifications: z.boolean().default(true),
  dtrNotifications: z.boolean().default(true),
  payrollNotifications: z.boolean().default(true),
  newDtrNotifications: z.boolean().default(true),
  autoApproveDTR: z.boolean().default(false),
});

// Security settings schema
const securitySchema = z.object({
  twoFactorAuth: z.boolean().default(false),
  sessionTimeout: z.string().default("30"),
  passwordExpiry: z.string().default("90"),
});

type BrandingValues = z.infer<typeof brandingSchema>;
type NotificationValues = z.infer<typeof notificationSchema>;
type SecurityValues = z.infer<typeof securitySchema>;

const Settings = () => {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    enabled: !!user,
  });

  // Fetch branding settings
  const { data: branding } = useQuery({
    queryKey: ["/api/branding"],
    enabled: !!user && isAdmin,
  });

  // Branding form
  const brandingForm = useForm<BrandingValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      companyName: branding?.companyName || "WorkTrack",
      primaryColor: branding?.primaryColor || "#0080FF",
      secondaryColor: branding?.secondaryColor || "#00BFFF",
      logo: branding?.logo || "",
      favicon: branding?.favicon || "",
    },
    values: {
      companyName: branding?.companyName || "WorkTrack",
      primaryColor: branding?.primaryColor || "#0080FF",
      secondaryColor: branding?.secondaryColor || "#00BFFF",
      logo: branding?.logo || "",
      favicon: branding?.favicon || "",
    },
  });

  // Notification settings form
  const notificationForm = useForm<NotificationValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: settings?.emailNotifications || true,
      dtrNotifications: settings?.dtrNotifications || true,
      payrollNotifications: settings?.payrollNotifications || true,
      newDtrNotifications: settings?.newDtrNotifications || true,
      autoApproveDTR: settings?.autoApproveDTR || false,
    },
    values: {
      emailNotifications: settings?.emailNotifications || true,
      dtrNotifications: settings?.dtrNotifications || true,
      payrollNotifications: settings?.payrollNotifications || true,
      newDtrNotifications: settings?.newDtrNotifications || true,
      autoApproveDTR: settings?.autoApproveDTR || false,
    },
  });

  // Security settings form
  const securityForm = useForm<SecurityValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      twoFactorAuth: settings?.twoFactorAuth || false,
      sessionTimeout: settings?.sessionTimeout || "30",
      passwordExpiry: settings?.passwordExpiry || "90",
    },
    values: {
      twoFactorAuth: settings?.twoFactorAuth || false,
      sessionTimeout: settings?.sessionTimeout || "30",
      passwordExpiry: settings?.passwordExpiry || "90",
    },
  });

  // Update branding settings mutation
  const updateBrandingMutation = useMutation({
    mutationFn: async (data: BrandingValues) => {
      const res = await apiRequest("PATCH", "/api/branding", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branding"] });
      toast({
        title: "Branding updated",
        description: "Your branding settings have been updated successfully.",
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

  // Update notification settings mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: NotificationValues) => {
      const res = await apiRequest("PATCH", "/api/settings/notifications", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Notifications updated",
        description: "Your notification settings have been updated successfully.",
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

  // Update security settings mutation
  const updateSecurityMutation = useMutation({
    mutationFn: async (data: SecurityValues) => {
      const res = await apiRequest("PATCH", "/api/settings/security", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Security settings updated",
        description: "Your security settings have been updated successfully.",
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

  const onBrandingSubmit = (data: BrandingValues) => {
    updateBrandingMutation.mutate(data);
  };

  const onNotificationsSubmit = (data: NotificationValues) => {
    updateNotificationsMutation.mutate(data);
  };

  const onSecuritySubmit = (data: SecurityValues) => {
    updateSecurityMutation.mutate(data);
  };

  // Handle logo file upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        brandingForm.setValue("logo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle favicon file upload
  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string);
        brandingForm.setValue("favicon", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PaintBucket className="h-5 w-5 mr-2 text-primary" />
                  Branding Settings
                </CardTitle>
                <CardDescription>
                  Customize your application branding and appearance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...brandingForm}>
                  <form onSubmit={brandingForm.handleSubmit(onBrandingSubmit)} className="space-y-4">
                    <FormField
                      control={brandingForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your company name" {...field} />
                          </FormControl>
                          <FormDescription>
                            This will be displayed in headers, emails, and reports
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={brandingForm.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Input type="text" placeholder="#0080FF" {...field} />
                              </FormControl>
                              <input
                                type="color"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="h-10 w-10 border-0 cursor-pointer"
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={brandingForm.control}
                        name="secondaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Color</FormLabel>
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Input type="text" placeholder="#00BFFF" {...field} />
                              </FormControl>
                              <input
                                type="color"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="h-10 w-10 border-0 cursor-pointer"
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Company Logo</Label>
                        <div className="border rounded-md p-4 flex flex-col items-center justify-center gap-2">
                          {logoPreview ? (
                            <div className="flex flex-col items-center gap-2">
                              <img src={logoPreview} alt="Logo preview" className="max-h-24 max-w-full" />
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setLogoPreview(null);
                                  brandingForm.setValue("logo", "");
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 text-gray-400" />
                              <p className="text-sm text-gray-500">Upload company logo</p>
                              <p className="text-xs text-gray-400">Recommended size: 200×60px</p>
                            </>
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="logo-upload"
                            onChange={handleLogoUpload}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-2"
                            onClick={() => document.getElementById("logo-upload")?.click()}
                          >
                            {logoPreview ? "Change Logo" : "Upload Logo"}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Favicon</Label>
                        <div className="border rounded-md p-4 flex flex-col items-center justify-center gap-2">
                          {faviconPreview ? (
                            <div className="flex flex-col items-center gap-2">
                              <img src={faviconPreview} alt="Favicon preview" className="max-h-16 max-w-full" />
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setFaviconPreview(null);
                                  brandingForm.setValue("favicon", "");
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 text-gray-400" />
                              <p className="text-sm text-gray-500">Upload favicon</p>
                              <p className="text-xs text-gray-400">Recommended size: 32×32px</p>
                            </>
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="favicon-upload"
                            onChange={handleFaviconUpload}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-2"
                            onClick={() => document.getElementById("favicon-upload")?.click()}
                          >
                            {faviconPreview ? "Change Favicon" : "Upload Favicon"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="mt-6"
                      disabled={updateBrandingMutation.isPending}
                    >
                      {updateBrandingMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Branding Settings"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure general application settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Default Timezone</Label>
                    <Select defaultValue="Asia/Manila">
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Manila">Philippines (GMT+8)</SelectItem>
                        <SelectItem value="Asia/Singapore">Singapore (GMT+8)</SelectItem>
                        <SelectItem value="America/New_York">New York (GMT-4)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Los Angeles (GMT-7)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT+1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select defaultValue="MM/DD/YYYY">
                      <SelectTrigger id="dateFormat">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="MMMM D, YYYY">MMMM D, YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select defaultValue="en-US">
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-PH">English (Philippines)</SelectItem>
                        <SelectItem value="fil-PH">Filipino</SelectItem>
                        <SelectItem value="es-ES">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select defaultValue="PHP">
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PHP">Philippine Peso (₱)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="mt-2">Save System Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Email Notifications</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive notifications via email
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                      
                      <Separator />
                      
                      <FormField
                        control={notificationForm.control}
                        name="dtrNotifications"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>DTR Approval Notifications</Label>
                              <p className="text-sm text-muted-foreground">
                                Get notified when your DTR is approved or rejected
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                      
                      <Separator />
                      
                      <FormField
                        control={notificationForm.control}
                        name="payrollNotifications"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Payroll Notifications</Label>
                              <p className="text-sm text-muted-foreground">
                                Get notified when a new payslip is available
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                      
                      {user?.role === "Admin" && (
                        <>
                          <div className="pt-4">
                            <h3 className="text-lg font-medium mb-2">Admin Notifications</h3>
                          </div>
                          
                          <FormField
                            control={notificationForm.control}
                            name="newDtrNotifications"
                            render={({ field }) => (
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label>New DTR Submissions</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Get notified when employees submit new DTRs
                                  </p>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </div>
                            )}
                          />
                          
                          <Separator />
                          
                          <FormField
                            control={notificationForm.control}
                            name="autoApproveDTR"
                            render={({ field }) => (
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label>Auto-Approve DTRs</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Automatically approve DTRs that match known formats
                                  </p>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </div>
                            )}
                          />
                        </>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="mt-6"
                      disabled={updateNotificationsMutation.isPending}
                    >
                      {updateNotificationsMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Notification Settings"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure security and authentication options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...securityForm}>
                  <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                    <FormField
                      control={securityForm.control}
                      name="twoFactorAuth"
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Enable Two-Factor Authentication</Label>
                            <p className="text-sm text-muted-foreground">
                              Add an extra layer of security to all user accounts
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      )}
                    />
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={securityForm.control}
                        name="sessionTimeout"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Timeout (minutes)</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timeout period" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="120">2 hours</SelectItem>
                                <SelectItem value="240">4 hours</SelectItem>
                                <SelectItem value="480">8 hours</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Time before users are automatically logged out due to inactivity
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="passwordExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password Expiry (days)</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select expiry period" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="60">60 days</SelectItem>
                                <SelectItem value="90">90 days</SelectItem>
                                <SelectItem value="180">180 days</SelectItem>
                                <SelectItem value="0">Never</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Time before users need to change their password
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="mt-6"
                      disabled={updateSecurityMutation.isPending}
                    >
                      {updateSecurityMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Security Settings"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {user?.role === "Admin" && (
              <Card>
                <CardHeader>
                  <CardTitle>Password Policy</CardTitle>
                  <CardDescription>
                    Configure password requirements for all users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Minimum password length</Label>
                      <p className="text-sm text-muted-foreground">
                        Require at least 8 characters
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require uppercase letters</Label>
                      <p className="text-sm text-muted-foreground">
                        Password must contain at least one uppercase letter
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require numbers</Label>
                      <p className="text-sm text-muted-foreground">
                        Password must contain at least one number
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require special characters</Label>
                      <p className="text-sm text-muted-foreground">
                        Password must contain at least one special character (e.g., !@#$%)
                      </p>
                    </div>
                    <Switch checked={false} />
                  </div>
                  
                  <Button className="mt-4">Save Password Policy</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;