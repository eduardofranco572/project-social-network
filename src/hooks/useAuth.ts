"use client";

import { useState } from 'react';
import * as authService from '@/src/services/authService';

type SignUpData = Parameters<typeof authService.signUp>[0];

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Função que será chamada pelo componente para iniciar o processo de cadastro.
   * @param data - Os dados do usuário para cadastro.
   * @returns `true` se o cadastro for bem-sucedido, `false` caso contrário.
   */
  const signUp = async (data: SignUpData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.signUp(data);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha no cadastro.');
      }

      return true;

    } catch (err: any) {
      setError(err.message);
      return false;

    } finally {
      setIsLoading(false);
    }
  };

  return {
    signUp,
    isLoading,
    error,
  };
};