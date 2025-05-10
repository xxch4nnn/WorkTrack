import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { 
  User, 
  Bell, 
  Lock, 
  CreditCard, 
  RefreshCw,
  ChevronRight, 
  ShieldCheck, 
  Save, 
  Moon, 
  Sun, 
  Eye, 
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import notificationService from '@/lib/services/notificationService';
import authService from '@/lib/services/authService';

// Schema for profile form
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

// Schema for password form
const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Schema for notification settings
const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  newEmployeeAlert: z.boolean(),
  dtrReviewAlert: z.boolean(),
  payrollProcessedAlert: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type NotificationFormData = z.infer<typeof notificationSchema>;

const Settings: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Get user data
  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/user');
        return await res.json();
      } catch (error) {
        // For demo, return mock user data
        return {
          id: 1,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          username: 'admin',
          role: 'Admin',
        };
      }
    }
  });
  
  // Get notification settings
  const { data: notificationSettings } = useQuery({
    queryKey: ['/api/user/notification-settings'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/user/notification-settings');
        return await res.json();
      } catch (error) {
        // For demo, return mock notification settings
        return {
          emailNotifications: true,
          pushNotifications: true,
          newEmployeeAlert: true,
          dtrReviewAlert: true,
          payrollProcessedAlert: true,
        };
      }
    }
  });
  
  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      email: userData?.email || '',
      username: userData?.username || '',
    },
  });
  
  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  // Notification form
  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: notificationSettings || {
      emailNotifications: true,
      pushNotifications: true,
      newEmployeeAlert: true,
      dtrReviewAlert: true,
      payrollProcessedAlert: true,
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const res = await apiRequest('PATCH', '/api/user', data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data);
      notificationService.success('Profile Updated', 'Your profile has been updated successfully');
    },
    onError: (error: any) => {
      notificationService.error('Update Failed', error.message || 'Failed to update profile');
    }
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const res = await apiRequest('PATCH', '/api/user/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      notificationService.success('Password Changed', 'Your password has been changed successfully');
    },
    onError: (error: any) => {
      notificationService.error('Password Change Failed', error.message || 'Failed to change password');
    }
  });
  
  // Update notification settings mutation
  const updateNotificationSettingsMutation = useMutation({
    mutationFn: async (data: NotificationFormData) => {
      const res = await apiRequest('PATCH', '/api/user/notification-settings', data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user/notification-settings'], data);
      notificationService.success('Notification Settings Updated', 'Your notification settings have been updated successfully');
    },
    onError: (error: any) => {
      notificationService.error('Update Failed', error.message || 'Failed to update notification settings');
    }
  });
  
  // Handle profile form submission
  const handleProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };
  
  // Handle password form submission
  const handlePasswordSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data);
  };
  
  // Handle notification form submission
  const handleNotificationSubmit = (data: NotificationFormData) => {
    updateNotificationSettingsMutation.mutate(data);
  };
  
  // Toggle dark mode (for demo purposes)
  const handleToggleDarkMode = () => {
    setDarkMode(prev => !prev);
    // In a real app, we would update the theme here
    notificationService.info('Theme Changed', `Switched to ${!darkMode ? 'dark' : 'light'} mode`);
  };

  // Send a test notification (for demo purposes)
  const sendTestNotification = () => {
    notificationService.success('Test Notification', 'This is a test notification to check if notifications are working properly.');
  };

  // Set up 2FA (for demo purposes)
  const setup2FA = () => {
    notificationService.info('2FA Setup', 'Two-factor authentication setup process has been started. Check your email for instructions.');
  };
  
  // Render the different settings tabs
  const renderTabContent = () => {
    switch (currentTab) {
      case 'profile':
        return (
          <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Profile Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="form-label">First Name</label>
                <input
                  {...profileForm.register('firstName')}
                  className="form-input"
                  placeholder="Enter your first name"
                />
                {profileForm.formState.errors.firstName && (
                  <span className="form-error">{profileForm.formState.errors.firstName.message}</span>
                )}
              </div>
              
              <div className="form-control">
                <label className="form-label">Last Name</label>
                <input
                  {...profileForm.register('lastName')}
                  className="form-input"
                  placeholder="Enter your last name"
                />
                {profileForm.formState.errors.lastName && (
                  <span className="form-error">{profileForm.formState.errors.lastName.message}</span>
                )}
              </div>
            </div>
            
            <div className="form-control">
              <label className="form-label">Email Address</label>
              <input
                {...profileForm.register('email')}
                className="form-input"
                placeholder="Enter your email address"
              />
              {profileForm.formState.errors.email && (
                <span className="form-error">{profileForm.formState.errors.email.message}</span>
              )}
            </div>
            
            <div className="form-control">
              <label className="form-label">Username</label>
              <input
                {...profileForm.register('username')}
                className="form-input"
                placeholder="Enter your username"
              />
              {profileForm.formState.errors.username && (
                <span className="form-error">{profileForm.formState.errors.username.message}</span>
              )}
            </div>
            
            <button
              type="submit"
              className="btn btn-primary mt-4"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        );
      
      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Security Settings</h2>
            
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
              <h3 className="text-lg font-medium mb-2">Change Password</h3>
              
              <div className="form-control">
                <label className="form-label">Current Password</label>
                <div className="relative">
                  <input
                    {...passwordForm.register('currentPassword')}
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="form-input pr-10"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowCurrentPassword(prev => !prev)}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <span className="form-error">{passwordForm.formState.errors.currentPassword.message}</span>
                )}
              </div>
              
              <div className="form-control">
                <label className="form-label">New Password</label>
                <div className="relative">
                  <input
                    {...passwordForm.register('newPassword')}
                    type={showNewPassword ? 'text' : 'password'}
                    className="form-input pr-10"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowNewPassword(prev => !prev)}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <span className="form-error">{passwordForm.formState.errors.newPassword.message}</span>
                )}
              </div>
              
              <div className="form-control">
                <label className="form-label">Confirm New Password</label>
                <div className="relative">
                  <input
                    {...passwordForm.register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input pr-10"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <span className="form-error">{passwordForm.formState.errors.confirmPassword.message}</span>
                )}
              </div>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock size={16} className="mr-2" />
                    Change Password
                  </>
                )}
              </button>
            </form>
            
            <div className="border-t border-gray-200 pt-4 mt-6">
              <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button 
                    onClick={setup2FA}
                    className="btn-outline flex items-center gap-2 px-3 py-2 text-sm"
                  >
                    <ShieldCheck size={16} />
                    Setup 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <form onSubmit={notificationForm.handleSubmit(handleNotificationSubmit)} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
            
            <div className="form-control">
              <div className="flex items-center justify-between py-2">
                <label className="text-sm font-medium cursor-pointer">
                  Email Notifications
                </label>
                <input
                  type="checkbox"
                  {...notificationForm.register('emailNotifications')}
                  className="toggle"
                />
              </div>
              <p className="text-sm text-gray-500">
                Receive notifications via email
              </p>
            </div>
            
            <div className="form-control">
              <div className="flex items-center justify-between py-2">
                <label className="text-sm font-medium cursor-pointer">
                  Push Notifications
                </label>
                <input
                  type="checkbox"
                  {...notificationForm.register('pushNotifications')}
                  className="toggle"
                />
              </div>
              <p className="text-sm text-gray-500">
                Receive notifications in the browser
              </p>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-medium mb-2">Alert Types</h3>
              
              <div className="form-control">
                <div className="flex items-center justify-between py-2">
                  <label className="text-sm font-medium cursor-pointer">
                    New Employee Alerts
                  </label>
                  <input
                    type="checkbox"
                    {...notificationForm.register('newEmployeeAlert')}
                    className="toggle"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Get notified when a new employee is added
                </p>
              </div>
              
              <div className="form-control">
                <div className="flex items-center justify-between py-2">
                  <label className="text-sm font-medium cursor-pointer">
                    DTR Review Alerts
                  </label>
                  <input
                    type="checkbox"
                    {...notificationForm.register('dtrReviewAlert')}
                    className="toggle"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Get notified when a DTR needs review
                </p>
              </div>
              
              <div className="form-control">
                <div className="flex items-center justify-between py-2">
                  <label className="text-sm font-medium cursor-pointer">
                    Payroll Processed Alerts
                  </label>
                  <input
                    type="checkbox"
                    {...notificationForm.register('payrollProcessedAlert')}
                    className="toggle"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Get notified when payroll is processed
                </p>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={sendTestNotification}
                className="btn-outline flex items-center gap-2 px-3 py-2 text-sm"
              >
                <Bell size={16} />
                Send Test Notification
              </button>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updateNotificationSettingsMutation.isPending}
              >
                {updateNotificationSettingsMutation.isPending ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          </form>
        );
      
      case 'appearance':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Appearance Settings</h2>
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Dark Mode</h4>
                  <p className="text-sm text-gray-500">
                    Toggle between light and dark theme
                  </p>
                </div>
                <button 
                  onClick={handleToggleDarkMode}
                  className="btn-outline flex items-center gap-2 px-3 py-2 text-sm"
                >
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Text Size</h4>
                  <p className="text-sm text-gray-500">
                    Adjust the size of text throughout the application
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-300">
                    A
                  </button>
                  <div className="w-16 h-1 bg-gray-300 rounded-full relative">
                    <div className="absolute top-0 left-1/2 h-3 w-3 bg-primary rounded-full -mt-1 -ml-1.5"></div>
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300">
                    A
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="space-y-1">
              <button
                onClick={() => setCurrentTab('profile')}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between ${
                  currentTab === 'profile' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <User size={16} className="mr-2" />
                  <span>Profile</span>
                </div>
                {currentTab === 'profile' && <ChevronRight size={16} />}
              </button>
              
              <button
                onClick={() => setCurrentTab('security')}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between ${
                  currentTab === 'security' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <Lock size={16} className="mr-2" />
                  <span>Security</span>
                </div>
                {currentTab === 'security' && <ChevronRight size={16} />}
              </button>
              
              <button
                onClick={() => setCurrentTab('notifications')}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between ${
                  currentTab === 'notifications' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <Bell size={16} className="mr-2" />
                  <span>Notifications</span>
                </div>
                {currentTab === 'notifications' && <ChevronRight size={16} />}
              </button>
              
              <button
                onClick={() => setCurrentTab('appearance')}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between ${
                  currentTab === 'appearance' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <Moon size={16} className="mr-2" />
                  <span>Appearance</span>
                </div>
                {currentTab === 'appearance' && <ChevronRight size={16} />}
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center px-3 py-2">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                  {userData?.firstName?.[0]}{userData?.lastName?.[0]}
                </div>
                <div className="ml-3">
                  <div className="font-medium">{userData?.firstName} {userData?.lastName}</div>
                  <div className="text-xs text-gray-500">{userData?.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Settings Content */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;