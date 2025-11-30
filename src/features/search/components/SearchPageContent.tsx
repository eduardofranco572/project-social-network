"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Search, User, ChevronRight, Loader2, Grid3X3, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from "@/lib/utils";

import { PostDetailModal } from '@/src/features/post/components/PostDetailModal';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { PostWithAuthor } from '@/src/features/post/components/types';

interface SearchUser {
    id: number;
    nome: string;
    username: string;
    foto: string;
}

type SearchTab = 'users' | 'posts';

export const SearchPageContent: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const [activeTab, setActiveTab] = useState<SearchTab>('users');
    
    const [userResults, setUserResults] = useState<SearchUser[]>([]);
    const [postResults, setPostResults] = useState<PostWithAuthor[]>([]);
    
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null);
    const { user: loggedInUser } = useCurrentUser();
    
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
            setPage(1); 
            setHasMore(true);
            if (activeTab === 'users') setUserResults([]);
            else setPostResults([]);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, activeTab]);

    const fetchResults = useCallback(async (pageNum: number) => {
        if (!debouncedTerm.trim()) return;
        
        setIsLoading(true);
        try {
            const endpoint = activeTab === 'users' 
                ? `/api/users/search?q=${encodeURIComponent(debouncedTerm)}&page=${pageNum}&limit=15`
                : `/api/post/search?q=${encodeURIComponent(debouncedTerm)}&page=${pageNum}&limit=15`; 

            const res = await fetch(endpoint);
            const data = await res.json();
            
            if (res.ok) {
                if (activeTab === 'users') {
                    setUserResults(prev => pageNum === 1 ? data.users : [...prev, ...data.users]);
                    setHasMore(data.hasMore);

                } else {
                    setPostResults(prev => {
                        const newPosts = data.posts || [];
                        if (pageNum === 1) return newPosts;
                        const uniquePosts = newPosts.filter((p: PostWithAuthor) => !prev.some(existing => existing._id === p._id));
                        return [...prev, ...uniquePosts];
                    });
                    setHasMore(data.hasMore);
                }
            }
        } catch (error) {
            console.error("Erro ao buscar", error);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedTerm, activeTab]);

    // Busca quando página ou termo mudar
    useEffect(() => {
        if (debouncedTerm) {
            fetchResults(page);
        } else {
            setUserResults([]);
            setPostResults([]);
            setIsLoading(false);
        }
    }, [page, debouncedTerm, fetchResults]);

    // Observer
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);

    return (
        <div className="w-full max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6">
            <div className="relative">
                <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                    <Search className="text-white" />
                    Pesquisar
                </h1>
                
                <div className="relative group mb-6">
                    <div className="absolute -inset-0.5 bg-zinc-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                    <div className="relative flex items-center bg-[#1c1c1c] rounded-lg p-1">
                        <Search className="ml-3 text-zinc-400 h-5 w-5" />
                        
                        <Input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={activeTab === 'users' ? "Buscar pessoas..." : "Buscar posts..."} 
                            className="border-none bg-transparent focus-visible:ring-0 text-base h-12 placeholder:text-zinc-500 text-white"
                            autoFocus
                        />

                        {isLoading && <Loader2 className="mr-3 animate-spin text-zinc-400 h-5 w-5" />}
                    </div>
                </div>

                <div className="flex border-b border-zinc-800 mb-6">
                    <button
                        onClick={() => { setActiveTab('users'); setUserResults([]); setPostResults([]); setSearchTerm(''); }}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative",
                            activeTab === 'users' ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <Users size={18} /> Pessoas
                        {activeTab === 'users' && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-full" />
                        )}
                    </button>

                    <button
                        onClick={() => { setActiveTab('posts'); setUserResults([]); setPostResults([]); setSearchTerm(''); }}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative",
                            activeTab === 'posts' ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <Grid3X3 size={18} /> Publicações

                        {activeTab === 'posts' && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-full" />
                        )}
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3 min-h-[200px]">
                {activeTab === 'users' && (
                    <>
                        {userResults.map((user, index) => {
                            const isLast = userResults.length === index + 1;
                            return (
                                <div key={user.id} ref={isLast ? lastElementRef : null}>
                                    <Link 
                                        href={`/perfil/${user.id}`}
                                        className="group relative bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 p-3 rounded-xl transition-all duration-300 hover:bg-zinc-900 hover:shadow-lg hover:shadow-white/5 hover:-translate-y-1 block"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <img 
                                                    src={user.foto || '/img/iconePadrao.svg'} 
                                                    alt={user.nome} 
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-white transition-colors duration-300"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-white text-sm group-hover:text-white transition-colors">
                                                        {user.nome}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">
                                                        @{user.username}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-zinc-600 group-hover:text-white transition-colors duration-300 group-hover:translate-x-1 transform">
                                                <ChevronRight size={18} />
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                        {userResults.length === 0 && !isLoading && searchTerm && (
                             <div className="text-center py-10 text-zinc-500">Nenhuma pessoa encontrada.</div>
                        )}
                    </>
                )}

                {activeTab === 'posts' && (
                    <>
                        <div className="grid grid-cols-3 gap-1">
                            {postResults.map((post, index) => {
                                const isLast = postResults.length === index + 1;
                                return (
                                    <div 
                                        key={post._id} 
                                        ref={isLast ? lastElementRef : null}
                                        onClick={() => setSelectedPost(post)} 
                                        className="aspect-square relative group overflow-hidden bg-zinc-900 cursor-pointer"
                                    >
                                        {post.media && post.media.length > 0 && post.media[0].type.startsWith('video/') ? (
                                            <video src={post.media[0].url} className="w-full h-full object-cover" />
                                        ) : (
                                            <img 
                                                src={post.media && post.media.length > 0 ? post.media[0].url : ''} 
                                                alt="Resultado" 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                );
                            })}
                        </div>
                        {postResults.length === 0 && !isLoading && searchTerm && (
                             <div className="text-center py-10 text-zinc-500">Nenhuma publicação encontrada.</div>
                        )}
                    </>
                )}

                {isLoading && (
                    <div className="flex justify-center py-4">
                        <Loader2 className="animate-spin text-zinc-500" />
                    </div>
                )}

                {!searchTerm && (
                    <div className="text-center py-20 text-zinc-600">
                        <p className="text-sm">Comece a digitar para pesquisar...</p>
                    </div>
                )}

                {selectedPost && (
                    <PostDetailModal 
                        post={selectedPost}
                        loggedInUser={loggedInUser}
                        onClose={() => setSelectedPost(null)}
                    />
                )}
            </div>
        </div>
    );
};