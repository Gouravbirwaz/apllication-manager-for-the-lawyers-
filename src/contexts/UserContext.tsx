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
        // Find the specific logged-in user. In a real app, this would be from a session.
        const loggedInUser = users.find(u => u.name === 'Gourav');
        
        if (loggedInUser) {
           // Manually assign a role for testing if not present
           if (!loggedInUser.role) {
             loggedInUser.role = 'main';
           }
           setUser(loggedInUser);
        } else if (users.length > 0) {
          const firstUser = users[0];
          if (!firstUser.role) {
             firstUser.role = 'main';
           }
          setUser(firstUser);
        }
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
