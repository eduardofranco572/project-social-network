"use client";

import { useState } from 'react';
import { signUp as authSignUp, signIn as authSignIn } from '@/src/services/authService';

type SignUpData = Parameters<typeof authSignUp>[0];
type SignInData = Parameters<typeof authSignIn>[0];

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (data: SignUpData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authSignUp(data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao cadastrar');
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro');
      return false;
    } finally {
      setIsLoading(false);
    }
  };


  const signIn = async (data: SignInData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authSignIn(data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao fazer login');
      }
      return true;

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro');
      return false;

    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    signUp,
    signIn 
  };
};