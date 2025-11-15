"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IoCloseOutline } from "react-icons/io5";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

import { HeartOff, MessageCircleOff, UserPlus, MapPin, Send } from 'lucide-react';
import '@/app/css/create-post-modal.css';

interface CreatePostModalProps {
  files: File[];
  onClose: () => void;
  
}

interface ThumbnailProps {
  selected: boolean;
  onClick: () => void;
  fileType: string; 
  fileUrl: string; 
}

const Thumbnail: React.FC<ThumbnailProps> = ({ selected, onClick, fileType, fileUrl }) => {
  const isVideo = fileType.startsWith('video/');
  
  return (
    <div className={`modal-thumbnail ${selected ? 'is-selected' : ''}`}>
      <button onClick={onClick} className="modal-thumbnail-button">
        {isVideo ? (
          <video
            src={fileUrl}
            muted
            className="modal-thumbnail-media"
          />
        ) : (
          <img
            src={fileUrl}
            alt="Thumbnail"
            className="modal-thumbnail-media"
          />
        )}
      </button>
    </div>
  );
};

const MainMedia = ({ fileType, fileUrl }: { fileType: string, fileUrl: string }) => {
  const isVideo = fileType.startsWith('video/');

  if (isVideo) {
    return (
      <video
        src={fileUrl}
        controls
        className="modal-main-media"
      >
        Seu navegador não suporta vídeos.
      </video>
    );
  }

  return (
    <img
      src={fileUrl}
      alt="Post media"
      className="modal-main-media"
    />
  );
};

const CreatePostModal: React.FC<CreatePostModalProps> = ({ files, onClose }) => {
  const [description, setDescription] = useState('');
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>(); 
  const [thumbApi, setThumbApi] = useState<CarouselApi>();

  const [mediaUrls, setMediaUrls] = useState<{ url: string; type: string }[]>([]);

  useEffect(() => {
    const urls = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type
    }));

    setMediaUrls(urls);

    return () => {
      urls.forEach(media => URL.revokeObjectURL(media.url));
    };
  }, [files]);

  // Rolar o carrossel ao clicar no thumbnail
  const onThumbClick = useCallback((index: number) => {
    if (!api) return;
    api.scrollTo(index);

  }, [api]);

  // Carrossel muda de slide
  const onSelect = useCallback(() => {
    if (!api) return;

    const newSelectedIndex = api.selectedScrollSnap();
    setSelectedIndex(newSelectedIndex);

    thumbApi?.scrollTo(newSelectedIndex, true); 

  }, [api, thumbApi]);


  useEffect(() => {
    if (!api) return;
    
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  const [hideLikes, setHideLikes] = useState(false);
  const [disableComments, setDisableComments] = useState(false);
  
  const handlePost = () => {
    console.log("Postando Post:", { 
      files, 
      description, 
      options: { hideLikes, disableComments } 
    });
    onClose();
  };

  const modalContent = (
    <section className="modal-overlay">
      <div className="modal-content-post modal-layout-wt">
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
                opts={{
                  align: "start",
                  containScroll: "keepSnaps",
                  dragFree: true,
                  slidesToScroll: 1,
                }}
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
          <div className="modal-closed" onClick={onClose}>
            <IoCloseOutline size={28} />
          </div>

          <h1 className="text-xl font-bold mb-4">Criar Novo Post</h1>
          
          <textarea
            placeholder="Escreva uma legenda..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="modal-textarea bg-neutral-800 border-neutral-700"
            rows={5}
          />
          
          <div className="modal-post-options">
            <h3 className="text-sm font-medium text-neutral-400 mb-2">Opções</h3>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => setHideLikes(!hideLikes)}
            >
              <HeartOff className={`mr-2 ${hideLikes ? 'text-primary' : ''}`} /> 
              Ocultar curtidas
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => setDisableComments(!disableComments)}
            >
              <MessageCircleOff className={`mr-2 ${disableComments ? 'text-primary' : ''}`} /> 
              Desativar comentários
            </Button>

            <Button variant="ghost" className="w-full justify-start text-neutral-500 cursor-not-allowed">
              <UserPlus className="mr-2" /> 
              Marcar pessoas (Em breve)
            </Button>

            <Button variant="ghost" className="w-full justify-start text-neutral-500 cursor-not-allowed">
              <MapPin className="mr-2" /> 
              Adicionar localização (Em breve)
            </Button>
          </div>

          <Button className='brtsaveedimg mt-auto' onClick={handlePost}>
            <Send />
            Postar
          </Button>
        </div>
      </div>
    </section>
  );

  return createPortal(modalContent, document.body);
};

export default CreatePostModal;