'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getUser, checkSupabaseConnection } from '../../lib/supabase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        // First check if Supabase connection is working
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          console.error('Failed to connect to Supabase. Authentication and favorites features will not work.');
        }
        
        const currentUser = await getUser();
        setUser(currentUser || null);
      } catch (error) {
        console.error('Error loading user:', error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const value = {
    user,
    loading,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}