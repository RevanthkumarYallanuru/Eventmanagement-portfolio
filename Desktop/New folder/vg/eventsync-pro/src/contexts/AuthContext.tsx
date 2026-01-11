import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage, User, UserRole } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isOrganizer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize default data
    storage.initializeDefaultData();
    
    // Check for existing session
    const currentUser = storage.getCurrentUser();
    if (currentUser) {
      // Verify user still exists in database
      const dbUser = storage.getUserById(currentUser.id);
      if (dbUser) {
        setUser(dbUser);
      } else {
        storage.setCurrentUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const foundUser = storage.getUserByEmail(email);
    
    if (!foundUser) {
      return { success: false, error: 'User not found' };
    }
    
    if (foundUser.password !== password) {
      return { success: false, error: 'Invalid password' };
    }

    // For organizers, check if they're active
    if (foundUser.role === 'organizer') {
      const organizer = storage.getOrganizerByUserId(foundUser.id);
      if (organizer && organizer.status === 'inactive') {
        return { success: false, error: 'Your account has been deactivated. Please contact admin.' };
      }
    }
    
    setUser(foundUser);
    storage.setCurrentUser(foundUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    storage.setCurrentUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isOrganizer: user?.role === 'organizer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
