"use client";

import React from 'react';
import { createPortal } from 'react-dom';
import { IoCloseOutline } from "react-icons/io5";
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { HeartOff, MessageCircleOff, UserPlus, MapPin, Send, Loader2 } from 'lucide-react';
import { useCreatePostModal } from '../hooks/useCreatePostModal';
import '@/app/css/create-post-modal.css';

interface CreatePostModalProps {
  files: File[];
  onClose: () => void;
}


const Thumbnail = ({ selected, onClick, fileType, fileUrl }: any) => {
  const isVideo = fileType.startsWith('video/');
  
  return (
    <div className={`modal-thumbnail ${selected ? 'is-selected' : ''}`}>
      <button onClick={onClick} className="modal-thumbnail-button">
        {isVideo ? (
          <video src={fileUrl} muted className="modal-thumbnail-media" />
        ) : (
          <img src={fileUrl} alt="Thumbnail" className="modal-thumbnail-media" />
        )}
      </button>
    </div>
  );
};

const MainMedia = ({ fileType, fileUrl }: { fileType: string, fileUrl: string }) => {
  if (fileType.startsWith('video/')) {
    return <video src={fileUrl} controls className="modal-main-media" >Seu navegador não suporta vídeos.</video>;
  }

  return <img src={fileUrl} alt="Post media" className="modal-main-media" />;
};

const CreatePostModal: React.FC<CreatePostModalProps> = ({ files, onClose }) => {
  
  const {
    mediaUrls,
    selectedIndex,
    setApi,
    setThumbApi,
    onThumbClick,
    description,
    setDescription,
    isLoading,
    handleSubmit,
    hideLikes,
    setHideLikes,
    disableComments,
    setDisableComments
  } = useCreatePostModal(files, onClose);

  const modalContent = (
    <section className="modal-overlay">
      <div className="modal-content-post modal-layout-wt">
        <div className="modal-closed z-50" onClick={onClose}>
            <IoCloseOutline size={28} />
        </div>

        <div className="modal-post-gallery with-thumbnails">
          <Carousel setApi={setApi} className="w-full modal-main-carousel h-full">
            <CarouselContent className="h-full">
              {mediaUrls.map((media, index) => (
                <CarouselItem key={index} className="h-full">
                  <div className="modal-main-item-container">
                    <MainMedia fileType={media.type} fileUrl={media.url} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {files.length > 1 && (
              <>
                <CarouselPrevious className="left-4 text-white bg-black/30 hover:bg-black/50 border-none" />
                <CarouselNext className="right-4 text-white bg-black/30 hover:bg-black/50 border-none" />
              </>
            )}
          </Carousel>
          
          {files.length > 1 && (
            <div className="modal-thumbnail-container">
              <Carousel
                setApi={setThumbApi}
                opts={{ align: "start", containScroll: "keepSnaps", dragFree: true, slidesToScroll: 1 }}
                className="w-full"
              >
                <CarouselContent className="p-1 pl-4">
                 {mediaUrls.map((media, index) => (
                    <CarouselItem key={index} className="modal-thumbnail-item">
                      <Thumbnail
                        selected={index === selectedIndex}
                        onClick={() => onThumbClick(index)}
                        fileType={media.type}
                        fileUrl={media.url}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          )}
        </div>

        <div className="modal-post-sidebar">
          <h1 className="text-xl font-bold mb-4">Criar Novo Post</h1>
          
          <textarea
            placeholder="Escreva uma legenda..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="modal-textarea bg-neutral-800 border-neutral-700"
            rows={5}
            disabled={isLoading} 
          />
          
          <div className="modal-post-options">
            <h3 className="text-sm font-medium text-neutral-400 mb-2">Opções</h3>

            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => setHideLikes(!hideLikes)}
              disabled={isLoading}
            >
              <HeartOff className={`mr-2 ${hideLikes ? 'text-primary' : ''}`} /> 
              Ocultar curtidas
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => setDisableComments(!disableComments)}
              disabled={isLoading}
            >
              <MessageCircleOff className={`mr-2 ${disableComments ? 'text-primary' : ''}`} /> 
              Desativar comentários
            </Button>

            <Button variant="ghost" className="w-full justify-start" disabled={isLoading}>
              <UserPlus className="mr-2" /> Marcar pessoas
            </Button>

            <Button variant="ghost" className="w-full justify-start" disabled={isLoading}>
              <MapPin className="mr-2" /> Adicionar localização
            </Button>
          </div>

          <Button 
            className='brtsaveedimg mt-6 w-full' 
            onClick={handleSubmit} 
            disabled={isLoading}
          >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 animate-spin" /> Postando...
                </>
            ) : (
              <>
                <Send className="mr-2" /> Postar
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

export default CreatePostModal;