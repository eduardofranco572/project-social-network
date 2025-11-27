"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X, MoreHorizontal, Loader2, Heart, Bookmark, Smile } from 'lucide-react';
import { PostWithAuthor, LoggedInUser } from './types';
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
import '@/app/css/post-detail-modal.css';
import { useFollow } from '@/src/hooks/useFollow';
import { useLike } from '../hooks/useLike';
import { cn } from "@/lib/utils";

import { DetailMedia } from './PostDetail/DetailMedia';
import { CommentItem } from './PostDetail/CommentItem';

import EmojiPicker, { Theme, EmojiStyle } from 'emoji-picker-react';

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
        replyingTo,
        setReplyingTo,
        hasMore,
        isLoadingComments,
        isPosting,
        handleLoadMore,
        handlePostComment,
        handleDeleteComment
    } = usePostDetail(post._id, loggedInUser, isPage);

    const { isLiked, likesCount, formattedLikes, toggleLike } = useLike(
        post._id, 
        post.likes || [], 
        loggedInUser?.id
    );

    const [api, setApi] = useState<CarouselApi>();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { isFollowing, toggleFollow, isLoading: isFollowLoading } = useFollow(post.author.id);
    const isOwnPost = loggedInUser?.id === post.author.id;

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

    useEffect(() => {
        if (replyingTo && inputRef.current) {
            inputRef.current.focus();
        }
    }, [replyingTo]);

    if (!mounted) return null;

    const rootComments = comments.filter(c => !c.parentId);

    const overlayClass = isPage 
        ? 'w-full h-full flex items-center justify-center bg-black' 
        : 'post-detail-overlay';


    const onEmojiClick = (emojiObject: any) => {
        setNewComment((prev) => prev + emojiObject.emoji);
        setShowEmojiPicker(false); 
    };    

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
                            <Link href={`/perfil/${post.author.id}`}>
                                <img 
                                    src={post.author.fotoPerfil} 
                                    alt={post.author.nome} 
                                    className="w-8 h-8 rounded-full object-cover border border-neutral-700 cursor-pointer hover:opacity-80 transition-opacity" 
                                />
                            </Link>

                            <div className='flex items-center gap-2'>
                                <Link href={`/perfil/${post.author.id}`}>
                                    <span className="font-semibold text-sm hover:opacity-80 cursor-pointer hover:underline">
                                        {post.author.nome}
                                    </span>
                                </Link>
                                
                                {!isOwnPost && (
                                    <>
                                        <span className='text-xs text-neutral-500'>-</span>

                                        {isFollowLoading ? (
                                            <div className="h-4 w-16 bg-neutral-800 animate-pulse rounded" />
                                        ) : (
                                            <button 
                                                onClick={toggleFollow}
                                                className={`text-sm font-semibold transition-colors ${isFollowing ? 'text-white hover:text-neutral-300' : 'text-blue-500 hover:text-white'}`}
                                            >
                                                {isFollowing ? 'Seguindo' : 'Seguir'}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <MoreHorizontal size={20} className="cursor-pointer hover:opacity-70" />
                    </div>

                    <div className="post-detail-comments-list scrollbar-hide flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                        {post.description && (
                            <div className="flex gap-3 mb-2">
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

                        {rootComments.map((comment) => (
                            <CommentItem 
                                key={comment._id}
                                comment={comment}
                                allComments={comments} 
                                onReply={(c) => setReplyingTo(c)} 
                                onDelete={handleDeleteComment} 
                                currentUserId={loggedInUser?.id}
                            />
                        ))}

                        {isLoadingComments && (
                            <div className="flex justify-center p-4">
                                <Loader2 className="animate-spin text-neutral-500" />
                            </div>
                        )}
                        
                        {!isLoadingComments && hasMore && (
                            <button onClick={handleLoadMore} className="text-center text-xs text-neutral-400 mt-2 p-2 hover:text-white group w-full">
                                <div className='flex items-center justify-center gap-2'>
                                    <span className='border-t border-neutral-700 flex-1 group-hover:border-neutral-500 transition-colors'></span>
                                    <span className='whitespace-nowrap'>Carregar mais</span>
                                    <span className='border-t border-neutral-700 flex-1 group-hover:border-neutral-500 transition-colors'></span>
                                </div>
                            </button>
                        )}
                    </div>

                    <div className="post-detail-footer bg-[#1c1c1c] z-10 p-4 border-t border-neutral-800 relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                                <div className='flex items-center'>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={toggleLike}
                                        className="h-9 w-9 hover:bg-transparent p-0 [&_svg]:size-6"
                                    >
                                        <Heart 
                                            className={cn(
                                                "transition-colors", 
                                                isLiked ? "fill-red-500 text-red-500" : "text-white hover:text-neutral-300"
                                            )} 
                                        />
                                    </Button>

                                    {likesCount > 0 && (
                                        <span className="text-sm font-semibold text-white">
                                            {formattedLikes}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 hover:bg-transparent p-0 text-white hover:text-neutral-300"
                            >
                                <Bookmark className="w-6 h-6" />
                            </Button>
                        </div>

                        {replyingTo && (
                            <div className="flex justify-between items-center text-xs text-neutral-400 mb-2 bg-neutral-800/50 p-2 rounded">
                                <span>Respondendo para <span className="font-bold text-white">{replyingTo.user.nome}</span></span>
                                <button onClick={() => setReplyingTo(null)}>
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {showEmojiPicker && (
                            <div className="absolute bottom-16 left-4 z-50">
                                <EmojiPicker 
                                    theme={Theme.DARK} 
                                    emojiStyle={EmojiStyle.APPLE}
                                    onEmojiClick={onEmojiClick}
                                    width={300}
                                    height={400}
                                    lazyLoadEmojis={true}
                                />
                            </div>
                        )}
                        
                        <form onSubmit={handlePostComment} className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-white hover:text-neutral-300 h-8 w-8 p-0"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                                <Smile size={24} />
                            </Button>

                            <Input 
                                ref={inputRef}
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                onFocus={() => setShowEmojiPicker(false)} 
                                placeholder={replyingTo ? `Responder a ${replyingTo.user.nome}...` : "Adicione um comentário..."} 
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