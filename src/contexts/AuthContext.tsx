import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { mockUsers } from '../data/mockData';
import toast from 'react-hot-toast';

type AuthUser = {
  username: string;
  role: 'admin' | 'pharmacist' | 'assistant';
  permissions: string[];
};

type AuthContextType = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUser(session.user);
      }
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleUser(session.user);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUser = async (supabaseUser: User) => {
    try {
      // First try to get user from Supabase database
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profile && !error) {
        const authUser: AuthUser = {
          username: profile.email,
          role: profile.role,
          permissions: getPermissionsByRole(profile.role),
        };
        
        setUser(authUser);
        setIsAuthenticated(true);
        return;
      }

      // If no profile found in database, try to find in mock data by email
      const mockUser = mockUsers.find(user => user.email === supabaseUser.email);
      
      if (mockUser) {
        const authUser: AuthUser = {
          username: mockUser.email,
          role: mockUser.role as 'admin' | 'pharmacist' | 'assistant',
          permissions: getPermissionsByRole(mockUser.role),
        };
        
        setUser(authUser);
        setIsAuthenticated(true);
      } else {
        console.error('No user profile found for:', supabaseUser.email);
        // Log out the user if no profile is found
        await supabase.auth.signOut();
        setUser(null);
        setIsAuthenticated(false);
        toast.error('Perfil de usuário não encontrado');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const getPermissionsByRole = (role: string): string[] => {
    switch (role) {
      case 'admin':
        return ['users.manage', 'medications.manage', 'batches.manage', 'inventory.manage', 'reports.view'];
      case 'pharmacist':
        return ['medications.manage', 'batches.manage', 'inventory.manage', 'reports.view'];
      case 'assistant':
        return ['medications.view', 'batches.view', 'inventory.view'];
      default:
        return [];
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      if (data.user) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission) || user.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}