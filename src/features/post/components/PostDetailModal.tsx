"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MoreHorizontal, Loader2, Volume2, VolumeX, Play } from 'lucide-react';
import { PostWithAuthor, LoggedInUser, MediaItem } from './types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
    Carousel, 
    CarouselContent, 
    CarouselItem, 
    CarouselNext, 
    CarouselPrevious,
    type CarouselApi 
} from "@/components/ui/carousel";
import { usePostDetail } from '../hooks/usePostDetail';
import { usePostMedia } from '../hooks/usePostMedia';
import '@/app/css/post-detail-modal.css';

interface DetailMediaProps {
    media: MediaItem;
    isVisible: boolean;
    isMuted: boolean;
    toggleMute: () => void;
}

const DetailMedia: React.FC<DetailMediaProps> = ({ media, isVisible, isMuted, toggleMute }) => {
    const { videoRef, userPaused, isVideo, togglePlay } = usePostMedia(
        media, 
        isVisible, 
        true, 
        isMuted
    );

    const containerClasses = "w-full h-full relative bg-black overflow-hidden";
    const mediaClasses = "w-full h-full object-contain pointer-events-auto";

    if (isVideo) {
        return (
            <div className={containerClasses} onClick={togglePlay}>
                <video
                    ref={videoRef}
                    src={media.url}
                    loop
                    playsInline
                    className={mediaClasses} 
                />
                
                {userPaused && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-20">
                        <Play className="h-20 w-20 text-white/90" fill="white" />
                    </div>
                )}

                <button 
                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                    className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-20"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            <img 
                src={media.url} 
                alt="Post Content" 
                className={mediaClasses}
            />
        </div>
    );
};

interface PostDetailModalProps {
    post: PostWithAuthor;
    loggedInUser: LoggedInUser | null;
    onClose: () => void;
    isPage?: boolean;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, loggedInUser, onClose, isPage = false }) => {
    const [mounted, setMounted] = useState(false);

    const {
        comments,
        newComment,
        setNewComment,
        hasMore,
        isLoadingComments,
        isPosting,
        handleLoadMore,
        handlePostComment
    } = usePostDetail(post._id, loggedInUser, isPage);

    const [api, setApi] = useState<CarouselApi>();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!api) return;
        setCurrentSlide(api.selectedScrollSnap());
        api.on("select", () => {
            setCurrentSlide(api.selectedScrollSnap());
        });
    }, [api]);

    if (!mounted) return null;

    const overlayClass = isPage 
        ? 'w-full h-full flex items-center justify-center bg-black' 
        : 'post-detail-overlay';

    const modalContent = (
        <div className={overlayClass} onClick={onClose}>
            
            <div className="post-detail-close-btn" onClick={onClose}>
                <X size={24} />
            </div>

            <div 
                className="post-detail-container w-full h-full max-h-[90vh] flex bg-black" 
                onClick={e => e.stopPropagation()}
            >
                <div className="post-detail-media h-full w-full bg-black">
                    <Carousel setApi={setApi} className="post-detail-carousel h-full w-full">
                        <CarouselContent className='h-full ml-0'>
                            {post.media.map((media, index) => (
                                <CarouselItem 
                                    key={media._id} 
                                    className="h-full w-full pl-0 relative"
                                >
                                    <DetailMedia 
                                        media={media}
                                        isVisible={index === currentSlide}
                                        isMuted={isMuted}
                                        toggleMute={() => setIsMuted(prev => !prev)}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                                                
                        {post.media.length > 1 && (
                            <>
                                <CarouselPrevious className="left-4 bg-black/50 text-white border-none hover:bg-black/70 hover:text-white z-30" />
                                <CarouselNext className="right-4 bg-black/50 text-white border-none hover:bg-black/70 hover:text-white z-30" />
                            </>
                        )}
                    </Carousel>
                </div>
                <div className="post-detail-info text-white flex flex-col h-full max-w-[400px] md:max-w-[500px] min-w-[300px] border-l border-neutral-800 bg-[#1c1c1c]">
                    <div className="post-detail-header p-4 border-b border-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img 
                                src={post.author.fotoPerfil} 
                                alt={post.author.nome} 
                                className="w-8 h-8 rounded-full object-cover border border-neutral-700" 
                            />

                            <div className='flex items-center gap-2'>
                                <span className="font-semibold text-sm hover:opacity-80 cursor-pointer">
                                    {post.author.nome}
                                </span>
                                <span className='text-xs text-neutral-500'>•</span>
                                
                                <button className='text-blue-500 text-sm font-semibold hover:text-white transition-colors'>
                                    Seguir
                                </button>
                            </div>
                        </div>

                        <MoreHorizontal size={20} className="cursor-pointer hover:opacity-70" />
                    </div>

                    <div className="post-detail-comments-list scrollbar-hide flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                        {post.description && (
                            <div className="flex gap-3">
                                <img 
                                    src={post.author.fotoPerfil} 
                                    alt="Autor"
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0" 
                                />

                                <div className='text-sm'>
                                    <span className="font-semibold mr-2">{post.author.nome}</span>
                                    <span>{post.description}</span>
                                    <div className='text-xs text-neutral-500 mt-1'>
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {comments.map((comment) => (
                            <div key={comment._id} className="flex gap-3">
                                <img 
                                    src={comment.user.foto} 
                                    alt={comment.user.nome}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0" 
                                />

                                <div className='text-sm'>
                                    <span className="font-semibold mr-2">{comment.user.nome}</span>
                                    <span>{comment.text}</span>
                                    <div className='text-xs text-neutral-500 mt-1 flex gap-3'>
                                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        <span className='cursor-pointer font-semibold hover:text-neutral-300'>Responder</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoadingComments && (
                            <div className="flex justify-center p-4">
                                <Loader2 className="animate-spin text-neutral-500" />
                            </div>
                        )}
                        
                        {!isLoadingComments && hasMore && (
                            <button 
                                onClick={handleLoadMore}
                                className="text-center text-xs text-neutral-400 mt-2 p-2 hover:text-white group w-full"
                            >
                                <div className='flex items-center justify-center gap-2'>
                                    <span className='border-t border-neutral-700 flex-1 group-hover:border-neutral-500 transition-colors'></span>
                                    <span className='whitespace-nowrap'>Carregar mais</span>
                                    <span className='border-t border-neutral-700 flex-1 group-hover:border-neutral-500 transition-colors'></span>
                                </div>
                            </button>
                        )}
                    </div>

                    <div className="post-detail-footer bg-[#1c1c1c] z-10 p-4 border-t border-neutral-800">
                        <form onSubmit={handlePostComment} className="flex items-center gap-2">
                            <Input 
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Adicione um comentário..." 
                                className="bg-transparent border-none focus-visible:ring-0 p-0 text-sm h-auto placeholder:text-neutral-500"
                                autoComplete="off"
                            />

                            <Button 
                                type="submit" 
                                variant="ghost" 
                                size="sm" 
                                disabled={!newComment.trim() || isPosting}
                                className="text-blue-500 font-semibold hover:text-white hover:bg-transparent disabled:opacity-50 p-0 h-auto"
                            >
                                {isPosting ? <Loader2 className="size-4 animate-spin" /> : 'Publicar'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );

    if (isPage) return modalContent;

    return createPortal(modalContent, document.body);
};