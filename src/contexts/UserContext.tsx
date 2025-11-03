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
      setIsLoading(true);
      try {
        const loggedInUserId = sessionStorage.getItem('userId');
        let userToSet = null;

        if (loggedInUserId) {
          // A user is logged in, fetch their specific data
          const userApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/get/user/${loggedInUserId}`;
          const response = await fetch(userApiUrl, {
            headers: { 'ngrok-skip-browser-warning': 'true' },
          });
          if (response.ok) {
            userToSet = await response.json();
          } else {
             console.error(`Failed to fetch user with ID ${loggedInUserId}`);
             sessionStorage.removeItem('userId'); // Clear invalid ID
          }
        } 
        
        if (!userToSet) {
          // Fallback for when no one is logged in: try to get the 'main' user for default view
          const allUsersApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/get/all_users`;
          const response = await fetch(allUsersApiUrl, {
            headers: { 'ngrok-skip-browser-warning': 'true' },
          });
           if (response.ok) {
              const users: User[] = await response.json();
              userToSet = users.find(u => u.role === 'main') || null;
           }
        }
        
        setUser(userToSet);

      } catch (error) {
        console.error("Failed to fetch user for UserContext:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();

    // Optional: Add event listener to handle changes in other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userId') {
        fetchUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };

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
