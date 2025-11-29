"use client";

import { useState } from 'react';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 1500,
  timerProgressBar: true,
  background: '#1c1c1c',
  color: '#ffffff',
});

export const useDeletePost = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePost = async (postId: string, onSuccess: () => void) => {
    
    const result = await Swal.fire({
      title: 'Você tem certeza?',
      text: "Este post será excluído permanentemente!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#555',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
      background: '#1c1c1c',
      color: '#ffffff'
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch('/api/post', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao excluir o post');
      }

      await Toast.fire({
        icon: 'success',
        title: 'Post excluído!'
      });
      
      onSuccess();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro';
      console.error("Erro ao excluir post:", error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMessage,
        background: '#1c1c1c',
        color: '#ffffff'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    handleDeletePost,
  };
};