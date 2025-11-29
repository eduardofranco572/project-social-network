"use client";

import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

interface LoggedInUser {
  id: number;
  nome: string;
  email: string;
  foto: string;
}

export const useCurrentUser = () => {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { socket } = useSocket(user?.id);

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

  useEffect(() => {
    if (!socket || !user) return;

    const handleUserUpdate = (updatedData: any) => {
      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
            ...prevUser,
            nome: updatedData.nome || prevUser.nome,
            foto: updatedData.foto || prevUser.foto
        };
      });
    };

    socket.on('user_updated', handleUserUpdate);

    return () => {
      socket.off('user_updated', handleUserUpdate);
    };
  }, [socket, user]);

  return { user, isLoading };
};