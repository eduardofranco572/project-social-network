"use client";

import React, { useCallback } from 'react';
import Link from 'next/link';
import { PostWithAuthor, LoggedInUser } from './types';
import { 
    Carousel,
    CarouselContent,
    CarouselItem,
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
    Play,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { cn } from "@/lib/utils"; 

import { usePostCard } from '../hooks/usePostCard';
import { usePostMedia } from '../hooks/usePostMedia';
import { useLike } from '../hooks/useLike';

import '@/app/css/post-card.css';

interface PostMediaProps {
    media: PostWithAuthor['media'][0];
    isSlideVisible: boolean; 
    isCardVisible: boolean;  
    isMuted: boolean;      
}

const PostMedia: React.FC<PostMediaProps> = (props) => {
    const { videoRef, userPaused, isVideo, togglePlay } = usePostMedia(
        props.media, 
        props.isSlideVisible, 
        props.isCardVisible, 
        props.isMuted
    );

    if (isVideo) {
        return (
            <div className="w-full h-full relative bg-black flex items-center justify-center" onClick={togglePlay}>
                <video
                    ref={videoRef}
                    src={props.media.url}
                    loop
                    playsInline
                    className="insta-media"
                >
                    Seu navegador não suporta vídeos.
                </video>
                
                {userPaused && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none transition-opacity duration-300 z-10">
                        <Play className="h-16 w-16 text-white" fill="white" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <img
            src={props.media.url}
            alt="Mídia do post"
            className="insta-media"
        />
    );
};

interface PostCardProps {
    post: PostWithAuthor;
    loggedInUser: LoggedInUser | null;
    onDeleteSuccess: () => void; 
    onCommentClick: (post: PostWithAuthor) => void;
    isModalOpen: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, loggedInUser, onDeleteSuccess, onCommentClick, isModalOpen }) => { 
    const {
        api, 
        setApi,
        current,
        count,
        isMuted,
        setIsMuted,
        cardRef,
        isCardVisible,
        isDeleting,
        isVideoPost,
        handleCopyLink,
        handleDelete
    } = usePostCard(post, onDeleteSuccess);

    const { isLiked, likesCount, formattedLikes, toggleLike } = useLike(
        post._id, 
        post.likes || [],
        loggedInUser?.id
    );

    const isAuthor = loggedInUser?.id === post.author.id;

    const handlePrev = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        api?.scrollPrev();
    }, [api]);

    const handleNext = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        api?.scrollNext();
    }, [api]);

    return (
        <article ref={cardRef} className="w-full max-w-md mx-auto bg-background border border-border rounded-lg mb-6">
            <header className="flex items-center p-2">
                <Link href={`/perfil/${post.author.id}`}>
                    <img 
                        src={post.author.fotoPerfil} 
                        alt={post.author.nome} 
                        className="w-10 h-10 rounded-full object-cover border border-neutral-700 cursor-pointer hover:opacity-80 transition-opacity"
                    />
                </Link>

                <Link href={`/perfil/${post.author.id}`}>
                    <span className="ml-3 font-semibold text-sm text-foreground hover:underline cursor-pointer">
                        {post.author.nome}
                    </span>
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
                                {isMuted ? <Volume2 className="mr-2" /> : <VolumeX className="mr-2" />}
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
                                onSelect={() => console.log('Denunciado')}
                            >
                                <AlertOctagon className="mr-2" />
                                Denunciar
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            <div className="w-full bg-black aspect-[4/5] relative group overflow-hidden"> 
                <Carousel setApi={setApi} className="insta-carousel">
                    <CarouselContent className="-ml-0">
                        {post.media.map((mediaItem, index) => ( 
                            <CarouselItem key={mediaItem._id} className="pl-0">
                                <div className="w-full h-full relative">
                                    <PostMedia 
                                        media={mediaItem} 
                                        isSlideVisible={index === current}
                                        isCardVisible={isCardVisible && !isModalOpen}
                                        isMuted={isMuted}
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    
                    {post.media.length > 1 && (
                        <>
                            <button 
                                onClick={handlePrev}
                                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 !w-8 !h-8 flex items-center justify-center rounded-full bg-black/60 text-white/90 backdrop-blur-sm transition-all hover:bg-black/80 hover:scale-110 active:scale-95 border-none cursor-pointer shadow-md"
                                type="button"
                            >
                                <ChevronLeft className="h-5 w-5 stroke-[3]" />
                            </button>

                            <button 
                                onClick={handleNext}
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 !w-8 !h-8 flex items-center justify-center rounded-full bg-black/60 text-white/90 backdrop-blur-sm transition-all hover:bg-black/80 hover:scale-110 active:scale-95 border-none cursor-pointer shadow-md"
                                type="button"
                            >
                                <ChevronRight className="h-5 w-5 stroke-[3]" />
                            </button>
                        </>
                    )}

                    {count > 1 && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
                            {Array.from({ length: count }).map((_, i) => (
                                <span
                                    key={i}
                                    className={cn(
                                        "h-1.5 w-1.5 rounded-full transition-colors shadow-sm", 
                                        i === current ? "bg-white" : "bg-white/40"
                                    )}
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
                        onClick={toggleLike}
                        className={cn(
                            "h-10 w-10 [&_svg]:size-6 transition-colors",
                            isLiked ? "text-red-500 hover:text-red-600" : "text-foreground hover:text-muted-foreground"
                        )}
                    >
                        <Heart 
                            className={cn("transition-all duration-300", isLiked && "fill-current scale-110")} 
                        />
                    </Button>

                    {likesCount > 0 && (
                        <span className="text-sm font-semibold min-w-[20px]">
                            {formattedLikes}
                        </span>
                    )}
                    
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onCommentClick(post)}
                        className="text-foreground hover:text-muted-foreground h-10 w-10 [&_svg]:size-6"
                    >
                        <MessageCircle />
                    </Button>

                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-foreground hover:text-muted-foreground h-10 w-10 [&_svg]:size-6 ml-auto"
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