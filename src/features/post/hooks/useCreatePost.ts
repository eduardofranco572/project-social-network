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

// Criar novo Post
export const useCreatePost = () => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePost = async (files: File[], onClose: () => void) => {
    if (!files || files.length === 0) {
      Toast.fire({ icon: 'error', title: 'Nenhum arquivo selecionado' });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', file);
    });

    formData.append('description', description);

    try {
      const response = await fetch('/api/post', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar o post');
      }

      await Toast.fire({
        icon: 'success',
        title: 'Post criado com sucesso!'
      });
      
      onClose();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro';
      console.error("Erro ao criar post:", error);
      
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