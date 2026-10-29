import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface User {
  id: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemoMode: boolean;
  isSupabaseConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signInDemo: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'demo-farmer-id',
  email: 'ramesh.farmer@agrivision.ai',
  displayName: 'Ramesh Reddy',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  useEffect(() => {
    // If demo session was active in localStorage
    const savedDemo = localStorage.getItem('agrivision_demo_auth');
    if (savedDemo === 'true') {
      setUser(DEMO_USER);
      setToken('demo-token');
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      // Default to demo user for smooth local evaluation if Supabase isn't configured yet
      setUser(DEMO_USER);
      setToken('demo-token');
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    // Supabase auth state listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Farmer',
        });
        setToken(session.access_token);
        setIsDemoMode(false);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Farmer',
        });
        setToken(session.access_token);
        setIsDemoMode(false);
      } else if (!isDemoMode) {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback demo sign in
      setUser({
        id: 'demo-farmer-id',
        email: email || DEMO_USER.email,
        displayName: email.split('@')[0] || DEMO_USER.displayName,
      });
      setIsDemoMode(true);
      localStorage.setItem('agrivision_demo_auth', 'true');
      return {};
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };

      if (data.session) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          displayName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Farmer',
        });
        setToken(data.session.access_token);
        setIsDemoMode(false);
        localStorage.removeItem('agrivision_demo_auth');
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to sign in' };
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      setUser({
        id: 'demo-farmer-id',
        email,
        displayName: displayName || email.split('@')[0],
      });
      setIsDemoMode(true);
      localStorage.setItem('agrivision_demo_auth', 'true');
      return {};
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: displayName },
        },
      });

      if (error) return { error: error.message };
      if (data.session) {
        setUser({
          id: data.user!.id,
          email: data.user!.email || '',
          displayName,
        });
        setToken(data.session.access_token);
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to sign up' };
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('agrivision_demo_auth');
    setUser(null);
    setToken(null);
    setIsDemoMode(false);
  };

  const signInDemo = () => {
    setUser(DEMO_USER);
    setToken('demo-token');
    setIsDemoMode(true);
    localStorage.setItem('agrivision_demo_auth', 'true');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoMode,
        isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        signInDemo,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

