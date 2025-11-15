"use client";

import { useState } from 'react';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#1c1c1c',
  color: '#ffffff',
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

//Hook para gerenciar a criação de um novo Status.
export const useCreateStatus = () => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePost = async (file: File, onClose: () => void) => {
    if (!file) return; 

    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    try {
      const response = await fetch('/api/status', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao postar status');
      }

      await Toast.fire({
        icon: 'success',
        title: 'Status postado com sucesso!'
      });
      
      onClose();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro';
      console.error("Erro ao postar status:", error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMessage,
        background: '#1c1c1c',
        color: '#ffffff'
      });

    } finally {
      setIsLoading(false);
    }
  };

  return {
    description,
    setDescription,
    isLoading,
    handlePost,
  };
};