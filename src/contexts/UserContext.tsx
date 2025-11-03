'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/get/all_users`;
        const response = await fetch(apiUrl, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const users: User[] = await response.json();
        // In a real app, this would come from a session.
        // For now, we'll find the user with the 'main' role.
        let loggedInUser = users.find(u => u.role === 'main');
        
        // If no 'main' user, fall back to the first user for demo purposes.
        if (!loggedInUser && users.length > 0) {
            loggedInUser = users[0];
            // Assign a default role if missing
            if (!loggedInAwaitedUser.role) {
                loggedInUser.role = 'lawyer';
            }
        }
        
        setUser(loggedInUser || null);

      } catch (error) {
        console.error("Failed to fetch user for UserContext:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
