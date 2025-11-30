"use client";

import React, { useEffect, useState } from 'react';
import { X, Bookmark, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { PostWithAuthor, LoggedInUser } from '@/src/features/post/components/types'; 
import { PostDetailModal } from '@/src/features/post/components/PostDetailModal'; 
import { useCurrentUser } from '@/src/hooks/useCurrentUser'; 

interface SavedPostsModalProps {
    userId: number;
    onClose: () => void;
}

export const SavedPostsModal: React.FC<SavedPostsModalProps> = ({ userId, onClose }) => {
    const [posts, setPosts] = useState<PostWithAuthor[]>([]); 
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null); 
    
    const { user: loggedInUser } = useCurrentUser(); 

    useEffect(() => {
        const fetchSaved = async () => {
            try {
                const res = await fetch(`/api/users/${userId}/saved`);
                if (res.ok) {
                    const data = await res.json();
                    setPosts(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSaved();
    }, [userId]);

    const content = (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#1c1c1c] w-full max-w-4xl h-[80vh] rounded-xl border border-zinc-800 flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <div className="flex items-center gap-2 text-white font-bold text-lg">
                        <Bookmark className="fill-white" />
                        Itens Salvos
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="animate-spin text-white" size={32} />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-zinc-500 gap-2">
                            <Bookmark size={48} strokeWidth={1} />
                            <p>Nenhum post salvo ainda.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-1 md:gap-4">
                            {posts.map((post) => (
                                <div 
                                    key={post._id} 
                                    onClick={() => setSelectedPost(post)} 
                                    className="aspect-square relative group cursor-pointer bg-zinc-900 overflow-hidden rounded-sm"
                                >
                                    {post.media[0].type.startsWith('video/') ? (
                                        <video src={post.media[0].url} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={post.media[0].url} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    )}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedPost && (
                <PostDetailModal 
                    post={selectedPost}
                    loggedInUser={loggedInUser}
                    onClose={() => setSelectedPost(null)} 
                />
            )}
        </div>
    );

    if (typeof document === 'undefined') return null;
    return createPortal(content, document.body);
};