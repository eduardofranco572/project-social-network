"use client";

import { useState, useEffect } from 'react';

interface LoggedInUser {
  id: number;
  nome: string;
  email: string;
  foto: string;
}

export const useCurrentUser = () => {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/me');

        if (!response.ok) {
          throw new Error('Não autenticado');
        }

        const data = await response.json();
        setUser(data);
        
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, isLoading };
};