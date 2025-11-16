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
});

export const useDeleteStatus = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (statusId: string, onSuccess: () => void) => {
    
    const result = await Swal.fire({
      title: 'Você tem certeza?',
      text: "Você não poderá reverter isso!",
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
      const response = await fetch('/api/status', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statusId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao excluir status');
      }

      await Toast.fire({
        icon: 'success',
        title: 'Status excluído!'
      });
      
      onSuccess();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro';
      console.error("Erro ao excluir status:", error);
      
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
    handleDelete,
  };
};