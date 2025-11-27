"use client";

import React, { useState } from 'react';
import { Loader2, Layers, MessageCircle, Heart } from 'lucide-react';
import { usePosts } from '@/src/features/post/hooks/usePosts';
import { PostWithAuthor } from '@/src/features/post/components/types';
import { PostDetailModal } from '@/src/features/post/components/PostDetailModal';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';

export const ExploreGrid: React.FC = () => {
    const { posts, isLoading, hasMore, lastPostElementRef } = usePosts(30); //limite de 30 post 
    const { user: loggedInUser } = useCurrentUser();
    const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null);

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 px-1">Explorar</h1>

            <div className="columns-2 md:columns-3 gap-4 space-y-4">
                {posts.map((post, index) => {
                    const isLast = posts.length === index + 1;
                    const isVideo = post.media[0].type.startsWith('video/');

                    return (
                        <div 
                            key={post._id}
                            ref={isLast ? lastPostElementRef : null}
                            className="relative group bg-zinc-900 cursor-pointer overflow-hidden rounded-md break-inside-avoid mb-4"
                            onClick={() => setSelectedPost(post)}
                        >
                            {isVideo ? (
                                <video 
                                    src={post.media[0].url} 
                                    className="w-full h-auto object-cover" 
                                />
                            ) : (
                                <img 
                                    src={post.media[0].url} 
                                    alt="Explore Post" 
                                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110" 
                                />
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 text-white font-bold z-10">
                                <div className="flex items-center gap-2">
                                    <Heart fill="white" size={20} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageCircle fill="white" size={20} />
                                </div>
                            </div>

                            <div className="absolute top-2 right-2 text-white drop-shadow-md z-20">
                                {post.media.length > 1 ? <Layers size={20} /> : (isVideo && <PlayIcon />)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {isLoading && (
                <div className="flex justify-center py-10 w-full">
                    <Loader2 className="animate-spin text-neutral-500" size={32} />
                </div>
            )}

            {!isLoading && !hasMore && posts.length > 0 && (
                <p className="text-center text-neutral-500 mt-10">Isso é tudo por enquanto.</p>
            )}

            {selectedPost && (
                <PostDetailModal 
                    post={selectedPost}
                    loggedInUser={loggedInUser}
                    onClose={() => setSelectedPost(null)}
                />
            )}
        </div>
    );
};

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play">
        <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
);