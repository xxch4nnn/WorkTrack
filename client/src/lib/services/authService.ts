import { apiRequest } from '../queryClient';
import { queryClient } from '../queryClient';
import notificationService from './notificationService';

// Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserData {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
}

// Auth Service
class AuthService {
  // Check if the user is authenticated
  async checkAuth(): Promise<UserData | null> {
    try {
      const res = await apiRequest('GET', '/api/user');
      return await res.json();
    } catch (error) {
      console.log('Not authenticated:', error);
      return null;
    }
  }

  // Login the user
  async login(credentials: LoginCredentials): Promise<UserData> {
    try {
      const res = await apiRequest('POST', '/api/login', credentials);
      const userData = await res.json();
      
      // Set the user data in the query cache
      queryClient.setQueryData(['/api/user'], userData);
      
      // Show a success notification
      notificationService.success(
        'Login Successful', 
        `Welcome back, ${userData.firstName}!`
      );
      
      return userData;
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid username or password';
      notificationService.error('Login Failed', errorMessage);
      throw error;
    }
  }

  // Register a new user
  async register(userData: any): Promise<UserData> {
    try {
      const res = await apiRequest('POST', '/api/register', userData);
      const newUser = await res.json();
      
      // Set the user data in the query cache
      queryClient.setQueryData(['/api/user'], newUser);
      
      // Show a success notification
      notificationService.success(
        'Registration Successful', 
        `Welcome, ${newUser.firstName}!`
      );
      
      return newUser;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to register user';
      notificationService.error('Registration Failed', errorMessage);
      throw error;
    }
  }

  // Logout the user
  async logout(): Promise<void> {
    try {
      await apiRequest('POST', '/api/logout');
      
      // Clear the user data from the query cache
      queryClient.setQueryData(['/api/user'], null);
      
      // Clear query cache
      queryClient.clear();
      
      // Show a success notification
      notificationService.info('Logged Out', 'You have been successfully logged out');
      
      // Redirect to login page - in a real app, this would be handled by the calling code
      window.location.href = '/auth';
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to logout';
      notificationService.error('Logout Failed', errorMessage);
      throw error;
    }
  }

  // Update user settings
  async updateSettings(settings: any): Promise<UserData> {
    try {
      const res = await apiRequest('PATCH', '/api/user/settings', settings);
      const updatedUser = await res.json();
      
      // Update the user data in the query cache
      queryClient.setQueryData(['/api/user'], updatedUser);
      
      // Show a success notification
      notificationService.success(
        'Settings Updated', 
        'Your settings have been successfully updated'
      );
      
      return updatedUser;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update settings';
      notificationService.error('Update Failed', errorMessage);
      throw error;
    }
  }

  // Change password
  async changePassword(passwords: { currentPassword: string; newPassword: string }): Promise<void> {
    try {
      await apiRequest('PATCH', '/api/user/password', passwords);
      
      // Show a success notification
      notificationService.success(
        'Password Changed', 
        'Your password has been successfully changed'
      );
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to change password';
      notificationService.error('Password Change Failed', errorMessage);
      throw error;
    }
  }

  // Get user permissions
  async getUserPermissions(): Promise<any> {
    try {
      const res = await apiRequest('GET', '/api/user/permissions');
      return await res.json();
    } catch (error) {
      console.error('Failed to get user permissions:', error);
      return {};
    }
  }
}

// Export a singleton instance
const authService = new AuthService();
export default authService;