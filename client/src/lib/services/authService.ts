import { apiRequest, queryClient } from '@/lib/queryClient';
import { User, InsertUser } from '@shared/schema';
import notificationService from './notificationService';

// Define error type for better error handling
interface ApiError {
  message?: string;
  [key: string]: any;
}

/**
 * Authentication service for handling user login, logout, and registration
 */
class AuthService {
  /**
   * Login a user with the given credentials
   */
  async login(username: string, password: string): Promise<User | null> {
    try {
      const res = await apiRequest('POST', '/api/login', { username, password });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Invalid username or password');
      }
      
      const userData = await res.json();
      // Update the query cache
      queryClient.setQueryData(['/api/user'], userData);
      
      notificationService.success(
        'Login Successful', 
        `Welcome back, ${userData.name || username}!`
      );
      
      return userData;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      notificationService.error(
        'Login Failed', 
        apiError.message || 'Unable to login. Please try again.'
      );
      return null;
    }
  }
  
  /**
   * Register a new user
   */
  async register(userData: InsertUser): Promise<User | null> {
    try {
      const res = await apiRequest('POST', '/api/register', userData);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const newUser = await res.json();
      // Update the query cache
      queryClient.setQueryData(['/api/user'], newUser);
      
      notificationService.success(
        'Registration Successful', 
        `Welcome, ${newUser.name || userData.username}!`
      );
      
      return newUser;
    } catch (error) {
      notificationService.error(
        'Registration Failed', 
        error.message || 'Unable to register. Please try again.'
      );
      return null;
    }
  }
  
  /**
   * Logout the current user
   */
  async logout(): Promise<boolean> {
    try {
      const res = await apiRequest('POST', '/api/logout');
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Logout failed');
      }
      
      // Clear the user from the query cache
      queryClient.setQueryData(['/api/user'], null);
      
      notificationService.success(
        'Logout Successful', 
        'You have been logged out.'
      );
      
      // Redirect to login page
      window.location.href = '/';
      
      return true;
    } catch (error) {
      notificationService.error(
        'Logout Failed', 
        error.message || 'Unable to logout. Please try again.'
      );
      return false;
    }
  }
  
  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await apiRequest('GET', '/api/user');
      
      if (!res.ok) {
        if (res.status === 401) {
          // User is not authenticated, but this is not an error
          return null;
        }
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to get user data');
      }
      
      const userData = await res.json();
      return userData;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  
  /**
   * Update the current user's profile
   */
  async updateProfile(data: Partial<User>): Promise<User | null> {
    try {
      const res = await apiRequest('PATCH', '/api/user', data);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const updatedUser = await res.json();
      // Update the query cache
      queryClient.setQueryData(['/api/user'], updatedUser);
      
      notificationService.success(
        'Profile Updated', 
        'Your profile has been updated successfully.'
      );
      
      return updatedUser;
    } catch (error) {
      notificationService.error(
        'Update Failed', 
        error.message || 'Unable to update profile. Please try again.'
      );
      return null;
    }
  }
  
  /**
   * Change the user's password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      const res = await apiRequest('POST', '/api/user/change-password', {
        oldPassword,
        newPassword
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to change password');
      }
      
      notificationService.success(
        'Password Changed', 
        'Your password has been changed successfully.'
      );
      
      return true;
    } catch (error) {
      notificationService.error(
        'Password Change Failed', 
        error.message || 'Unable to change password. Please try again.'
      );
      return false;
    }
  }
}

// Create a singleton instance
const authService = new AuthService();
export default authService;