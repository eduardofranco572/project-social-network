"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PostWithAuthor, LoggedInUser } from './types';
import { 
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi, 
} from "@/components/ui/carousel";
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { 
    Heart, 
    MessageCircle, 
    Bookmark, 
    MoreHorizontal, 
    Trash2, 
    LinkIcon, 
    AlertOctagon,
    Volume2, 
    VolumeX,
    Play 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { cn } from "@/lib/utils"; 
import { useDeletePost } from '../hooks/useDeletePost'; 
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface PostMediaProps {
    media: PostWithAuthor['media'][0];
    isSlideVisible: boolean; 
    isCardVisible: boolean;  
    isMuted: boolean;      
}

const PostMedia: React.FC<PostMediaProps> = ({ 
    media, 
    isSlideVisible, 
    isCardVisible, 
    isMuted 
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [userPaused, setUserPaused] = useState(false); 
    const isVideo = media.type.startsWith('video/');

    const isActuallyVisible = isCardVisible && isSlideVisible;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const shouldPlay = isActuallyVisible && !userPaused;

        if (shouldPlay) {
            video.play().catch(e => {});
        } else {
            video.pause();
        }

        if (!isActuallyVisible) {
            video.currentTime = 0;
            setUserPaused(false);
        }

    }, [isActuallyVisible, userPaused]);

    // Mute
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    // Pausar
    const handleClick = () => {
        if (isActuallyVisible) { 
            setUserPaused(prev => !prev);
        }
    };

    if (isVideo) {
        return (
            <div className="w-full h-full relative" onClick={handleClick}>
                <video
                    ref={videoRef}
                    src={media.url}
                    loop
                    playsInline
                    className="w-full h-full object-cover" 
                >
                    Seu navegador não suporta vídeos.
                </video>
                
                {userPaused && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none transition-opacity duration-300">
                        <Play className="h-16 w-16 text-white" fill="white" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <img
            src={media.url}
            alt="Mídia do post"
            className="w-full h-full object-cover" 
        />
    );
};

interface PostCardProps {
    post: PostWithAuthor;
    loggedInUser: LoggedInUser | null;
    onDeleteSuccess: () => void; 
}

export const PostCard: React.FC<PostCardProps> = ({ post, loggedInUser, onDeleteSuccess }) => {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0); 
    const [count, setCount] = useState(0);     
    
    const { isDeleting, handleDeletePost } = useDeletePost();

    const cardRef = useRef(null);
    const isCardVisible = useIntersectionObserver(cardRef, { threshold: 0.5 }); 
    const [isMuted, setIsMuted] = useState(true);

    const isVideoPost = post.media.some(m => m.type.startsWith('video/'));

    useEffect(() => {
        if (!api) return;
    
        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());
    
        const onSelect = () => {
            setCurrent(api.selectedScrollSnap());
        };
    
        api.on("select", onSelect);
    
        return () => {
            api.off("select", onSelect);
        };
    }, [api]);

    const isAuthor = loggedInUser?.id === post.author.id;

    const postUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/p/${post._id}` 
        : `/p/${post._id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(postUrl);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Link copiado!',
            showConfirmButton: false,
            timer: 2000,
            background: '#1c1c1c',
            color: '#ffffff',
        });
    };
    
    const handleLike = () => console.log('Like');
    const handleComment = () => console.log('Abrir modal de comentários');
    const handleSave = () => console.log('Salvar post');
    const handleReport = () => console.log('Denunciar post');
    
    const handleDelete = () => {
        handleDeletePost(post._id, onDeleteSuccess);
    };


    return (
        <article ref={cardRef} className="w-full max-w-md mx-auto bg-background border border-border rounded-lg mb-6">
            <header className="flex items-center p-2">
                <img 
                    src={post.author.fotoPerfil} 
                    alt={post.author.nome} 
                    className="w-10 h-10 rounded-full object-cover border border-neutral-700"
                />
                <Link href={`/perfil/${post.author.id}`}>
                    <span className="ml-3 font-semibold text-sm text-foreground">{post.author.nome}</span>
                </Link>


                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-auto" disabled={isDeleting}>
                            <MoreHorizontal className="size-5" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={handleCopyLink}>
                            <LinkIcon className="mr-2" />
                            Copiar Link
                        </DropdownMenuItem>
                        
                        {isVideoPost && (
                            <DropdownMenuItem onSelect={() => setIsMuted(prev => !prev)}>
                                {isMuted ? (
                                    <Volume2 className="mr-2" />
                                ) : (
                                    <VolumeX className="mr-2" />
                                )}
                                {isMuted ? "Ativar Som" : "Silenciar"}
                            </DropdownMenuItem>
                        )}

                        {isAuthor && (
                            <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onSelect={handleDelete}
                                disabled={isDeleting} 
                            >
                                <Trash2 className="mr-2" />
                                {isDeleting ? 'Excluindo...' : 'Excluir'}
                            </DropdownMenuItem>
                        )}
                        
                        {!isAuthor && (
                            <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onSelect={handleReport}
                            >
                                <AlertOctagon className="mr-2" />
                                Denunciar
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            <div className="w-full bg-black aspect-[4/5] relative"> 
                <Carousel setApi={setApi} className="w-full h-full">
                    <CarouselContent className="h-full">
                        {post.media.map((mediaItem, index) => ( 
                            <CarouselItem key={mediaItem._id} className="h-full">
                                <div className="w-full h-full flex items-center justify-center">
                                    <PostMedia 
                                        media={mediaItem} 
                                        isSlideVisible={index === current}
                                        isCardVisible={isCardVisible}
                                        isMuted={isMuted}
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    
                    {post.media.length > 1 && (
                        <>
                            <CarouselPrevious className="left-2 bg-black/30 text-white hover:bg-black/50 hover:text-white border-none" />
                            <CarouselNext className="right-2 bg-black/30 text-white hover:bg-black/50 hover:text-white border-none" />
                        </>
                    )}

                    {count > 1 && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                            {Array.from({ length: count }).map((_, i) => (
                                <span
                                    key={i}
                                    className={cn(
                                        "h-1.5 w-1.5 rounded-full transition-colors", 
                                        i === current ? "bg-white" : "bg-white/40"
                                    )}
                                    aria-label={`Slide ${i + 1} de ${count}`}
                                />
                            ))}
                        </div>
                    )}
                </Carousel>
            </div>
            <footer className="flex items-center p-2">
                <div className="flex items-center">
                    <Button 
                        variant="ghost"
                        size="icon" 
                        onClick={handleLike} 
                        className="text-foreground hover:text-muted-foreground h-10 w-10 [&_svg]:size-5"
                    >
                        <Heart />
                    </Button>
                    
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleComment} 
                        className="text-foreground hover:text-muted-foreground h-10 w-10 [&_svg]:size-5"
                    >
                        <MessageCircle />
                    </Button>

                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleSave} 
                        className="text-foreground hover:text-muted-foreground h-10 w-10 [&_svg]:size-5"
                    >
                        <Bookmark />
                    </Button>
                </div>
            </footer>

            {post.description && (
                <div className="px-4 pb-4">
                    <p className="text-sm text-foreground">
                        <Link href={`/perfil/${post.author.id}`}>
                            <span className="font-semibold mr-1.5">{post.author.nome}</span>
                        </Link>
                        {post.description}
                    </p>
                </div>
            )}
        </article>
    );
};