import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Cog, UserCog, Building, FileText, CreditCard, AlertCircle } from "lucide-react";

const profileFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password || data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Settings = () => {
  const [currentTab, setCurrentTab] = useState("profile");
  const { toast } = useToast();

  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['/api/users/profile'],
  });

  const { data: systemSettings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['/api/settings'],
  });

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: userProfile?.firstName || "",
      lastName: userProfile?.lastName || "",
      email: userProfile?.email || "",
      password: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      await apiRequest("PATCH", "/api/users/profile", values);
      await queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleSetting = async (setting: string, enabled: boolean) => {
    try {
      await apiRequest("PATCH", "/api/settings", {
        [setting]: enabled,
      });
      await queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Setting Updated",
        description: `The ${setting} setting has been ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update setting. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearData = async (dataType: string) => {
    try {
      await apiRequest("DELETE", `/api/${dataType}/clear`, {});
      toast({
        title: "Data Cleared",
        description: `All ${dataType} data has been cleared successfully.`,
      });
    } catch (error) {
      toast({
        title: "Operation Failed",
        description: `Failed to clear ${dataType} data. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleSystemBackup = async () => {
    try {
      await apiRequest("POST", "/api/system/backup", {});
      toast({
        title: "Backup Created",
        description: "System backup has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to create system backup. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account settings and system preferences.
          </p>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="profile" className="flex items-center">
            <UserCog className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center">
            <Cog className="mr-2 h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your account information and password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isProfileLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                      <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Leave blank to keep current" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm new password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit">Save Changes</Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide preferences and notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSettingsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between py-3">
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                        <div className="h-3 bg-gray-100 rounded w-60 animate-pulse"></div>
                      </div>
                      <div className="h-6 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications for important events
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={systemSettings?.emailNotifications}
                      onCheckedChange={(checked) => handleToggleSetting('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-approve-dtr" className="text-base">Auto-Approve DTR</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically approve DTR entries for regular employees
                      </p>
                    </div>
                    <Switch
                      id="auto-approve-dtr"
                      checked={systemSettings?.autoApproveDTR}
                      onCheckedChange={(checked) => handleToggleSetting('autoApproveDTR', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekend-ot" className="text-base">Weekend Overtime Bonus</Label>
                      <p className="text-sm text-muted-foreground">
                        Apply 1.5x multiplier for weekend work hours
                      </p>
                    </div>
                    <Switch
                      id="weekend-ot"
                      checked={systemSettings?.weekendOvertimeBonus}
                      onCheckedChange={(checked) => handleToggleSetting('weekendOvertimeBonus', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-backup" className="text-base">Automatic Data Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        Create automatic backups of system data weekly
                      </p>
                    </div>
                    <Switch
                      id="data-backup"
                      checked={systemSettings?.automaticBackup}
                      onCheckedChange={(checked) => handleToggleSetting('automaticBackup', checked)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={handleSystemBackup}>
                Create System Backup
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Settings</CardTitle>
              <CardDescription>
                Configure default rates, tax settings, and deductions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Default Rates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="regular-rate">Regular Hourly Rate</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">₱</span>
                        <Input
                          id="regular-rate"
                          type="number"
                          className="rounded-l-none"
                          defaultValue={systemSettings?.defaultHourlyRate || 0}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              handleToggleSetting('defaultHourlyRate', value);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="overtime-multiplier">Overtime Multiplier</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">x</span>
                        <Input
                          id="overtime-multiplier"
                          type="number"
                          step="0.1"
                          className="rounded-l-none"
                          defaultValue={systemSettings?.overtimeMultiplier || 1.25}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              handleToggleSetting('overtimeMultiplier', value);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Tax & Deductions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tax-rate">Income Tax Rate</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">%</span>
                        <Input
                          id="tax-rate"
                          type="number"
                          step="0.1"
                          className="rounded-l-none"
                          defaultValue={systemSettings?.taxRate || 10}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              handleToggleSetting('taxRate', value);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sss-rate">SSS Contribution</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">%</span>
                        <Input
                          id="sss-rate"
                          type="number"
                          step="0.1"
                          className="rounded-l-none"
                          defaultValue={systemSettings?.sssRate || 3.63}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              handleToggleSetting('sssRate', value);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="philhealth-rate">PhilHealth Rate</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">%</span>
                        <Input
                          id="philhealth-rate"
                          type="number"
                          step="0.1"
                          className="rounded-l-none"
                          defaultValue={systemSettings?.philhealthRate || 2.75}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              handleToggleSetting('philhealthRate', value);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 py-4">
                  <Switch
                    id="apply-tax"
                    checked={systemSettings?.applyTaxDeductions}
                    onCheckedChange={(checked) => handleToggleSetting('applyTaxDeductions', checked)}
                  />
                  <Label htmlFor="apply-tax">Apply tax and deductions to all employees</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage system data and perform maintenance operations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border rounded-lg bg-yellow-50 flex items-start space-x-4">
                  <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Data Management Warning</h4>
                    <p className="text-sm text-yellow-700">
                      The operations on this page will permanently modify or delete data in the system.
                      Make sure to create a backup before proceeding with any data clearing operation.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <h4 className="font-medium">Clear DTR Data</h4>
                      <p className="text-sm text-gray-500">
                        Remove all DTR entries from the system
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => handleClearData('dtrs')}>
                      Clear DTRs
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <h4 className="font-medium">Clear Payroll Data</h4>
                      <p className="text-sm text-gray-500">
                        Remove all payroll records from the system
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => handleClearData('payrolls')}>
                      Clear Payrolls
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <h4 className="font-medium">Clear Activity Logs</h4>
                      <p className="text-sm text-gray-500">
                        Remove all activity logs from the system
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => handleClearData('activities')}>
                      Clear Logs
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="font-medium text-red-600">Reset All Data</h4>
                      <p className="text-sm text-red-500">
                        Remove all data and reset the system to its initial state
                      </p>
                    </div>
                    <Button variant="destructive" onClick={() => handleClearData('all')}>
                      Reset System
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
