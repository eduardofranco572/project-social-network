"use client";

import { useEffect } from 'react';
import useSWR from 'swr';
import { useSocket } from './useSocket';
import { fetcher } from '@/src/lib/fetcher'; 

interface LoggedInUser {
  id: number;
  nome: string;
  email: string;
  foto: string;
}

export const useCurrentUser = () => {
  const { data: user, error, isLoading, mutate } = useSWR<LoggedInUser>('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, 
    shouldRetryOnError: false 
  });
  
  const { socket } = useSocket(user?.id);

  useEffect(() => {
    if (!socket || !user) return;

    const handleUserUpdate = (updatedData: any) => {
      if (updatedData.id === user.id) {
        mutate({ ...user, ...updatedData }, false);
      }
    };

    socket.on('user_updated', handleUserUpdate);

    return () => {
      socket.off('user_updated', handleUserUpdate);
    };
  }, [socket, user, mutate]);

  return { user, isLoading, error };
};