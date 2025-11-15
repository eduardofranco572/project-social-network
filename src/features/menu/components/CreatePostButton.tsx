"use client";

import { useState, useRef } from 'react';
import {
  ImageIcon,
  MessageCircle,
  PlusSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import CreateStatusModal from '@/src/features/status/components/CreateStatusModal';
import CreatePostModal from '@/src/features/post/components/CreatePostModal';

export function CreatePostButton() {
  const statusInputRef = useRef<HTMLInputElement>(null);
  const postInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Funções para o Modal de Status 
  const handleStatusFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles([e.target.files[0]]);
      setIsStatusModalOpen(true);
      e.target.value = '';
    }
  };
  
  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
    setSelectedFiles([]);
  };

  // Funções para o Modal de Post
  const handlePostFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
      setIsPostModalOpen(true);
      e.target.value = '';
    }
  };

  const closePostModal = () => {
    setIsPostModalOpen(false);
    setSelectedFiles([]);
  };

  return (
    <>
      <input
        type="file"
        accept="image/*,video/*"
        ref={statusInputRef}
        onChange={handleStatusFileChange}
        style={{ display: 'none' }}
      />

      <input
        type="file"
        accept="image/*,video/*"
        multiple
        ref={postInputRef}
        onChange={handlePostFileChange}
        style={{ display: 'none' }}
      />

      {isStatusModalOpen && selectedFiles.length > 0 && (
        <CreateStatusModal 
          file={selectedFiles[0]} 
          onClose={closeStatusModal} 
        />
      )}
      
      {isPostModalOpen && selectedFiles.length > 0 && (
        <CreatePostModal 
          files={selectedFiles} 
          onClose={closePostModal} 
        />
      )}

      <div className="px-4 pb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full justify-center text-base h-10 gap-1.5">
              <PlusSquare />
              Criar
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)]"
            align="start"
            side="top"
            sideOffset={8}
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => postInputRef.current?.click()}
            >
              <ImageIcon className="mr-2" />
              <span>Novo Post</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => statusInputRef.current?.click()}
            >
              <MessageCircle className="mr-2" />
              <span>Novo Status</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}