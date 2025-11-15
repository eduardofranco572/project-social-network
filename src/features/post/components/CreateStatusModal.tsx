"use client";

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { IoCloseOutline } from "react-icons/io5";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react'; 

import '@/app/css/create-post-modal.css';

interface CreateStatusModalProps {
  file: File;
  onClose: () => void;
}

const FilePreview = ({ file }: { file: File }) => {
  const fileUrl = URL.createObjectURL(file);

  if (file.type.startsWith('video/')) {
    return (
      <video
        src={fileUrl}
        controls
        className="modal-status-media" 
      />
    );
  }

  return (
    <img
      src={fileUrl}
      alt="Preview"
      className="modal-status-media"
      onLoad={() => URL.revokeObjectURL(fileUrl)} 
    />
  );
};

const CreateStatusModal: React.FC<CreateStatusModalProps> = ({ file, onClose }) => {
  const [description, setDescription] = useState('');

  const handlePost = () => {
    console.log("Postando Status:", { file, description });
    onClose();
  };

  const modalContent = (
    <section className="modal-overlay">
      <div className="modal-content-post modal-content-status">
        <div className="modal-closed" onClick={onClose}>
          <IoCloseOutline size={24} />
        </div>

        <h1>Novo Status</h1>
        
        <div className="modal-preview-status">
          <FilePreview file={file} />
        </div>

        <Input
          type="text"
          placeholder="Adicionar uma descrição..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-4 bg-neutral-800 border-neutral-700 h-10"
        />
        
        <div className="w-full flex justify-end mt-6">
          <Button className='brtsaveedimg' onClick={handlePost}>
            <Send />
            Postar Status
          </Button>
        </div>
      </div>
    </section>
  );

  return createPortal(modalContent, document.body);
};

export default CreateStatusModal;