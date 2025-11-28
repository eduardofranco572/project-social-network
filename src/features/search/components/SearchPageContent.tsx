"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, User, ChevronRight, Loader2, Grid3X3, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from "@/lib/utils";

interface SearchUser {
    id: number;
    nome: string;
    username: string;
    foto: string;
}

interface SearchPost {
    _id: string;
    media: { url: string; type: string };
    description?: string;
}

type SearchTab = 'users' | 'posts';

export const SearchPageContent: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<SearchTab>('users');
    
    const [userResults, setUserResults] = useState<SearchUser[]>([]);
    const [postResults, setPostResults] = useState<SearchPost[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (searchTerm.trim().length === 0) {
            setUserResults([]);
            setPostResults([]);
            setIsLoading(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsLoading(true);
            try {
                const endpoint = activeTab === 'users' 
                    ? `/api/users/search?q=${encodeURIComponent(searchTerm)}`
                    : `/api/post/search?q=${encodeURIComponent(searchTerm)}`; 

                const res = await fetch(endpoint);
                
                if (res.ok) {
                    const data = await res.json();
                    if (activeTab === 'users') {
                        setUserResults(data || []);
                    } else {
                        setPostResults(data || []);
                    }
                } else {
                    if (activeTab === 'users') setUserResults([]);
                    else setPostResults([]);
                }
            } catch (error) {
                console.error("Erro ao buscar", error);
                setUserResults([]);
                setPostResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, activeTab]);

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
                            placeholder={activeTab === 'users' ? "Buscar pessoas..." : "Buscar posts (ex: gato, praia)..."} 
                            className="border-none bg-transparent focus-visible:ring-0 text-base h-12 placeholder:text-zinc-500 text-white"
                            autoFocus
                        />
                        {isLoading && <Loader2 className="mr-3 animate-spin text-zinc-400 h-5 w-5" />}
                    </div>
                </div>

                <div className="flex border-b border-zinc-800 mb-6">
                    <button
                        onClick={() => { setActiveTab('users'); setUserResults([]); setPostResults([]); }}
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
                        onClick={() => { setActiveTab('posts'); setUserResults([]); setPostResults([]); }}
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
                        {userResults.length > 0 ? (
                            userResults.map((user) => (
                                <Link 
                                    key={user.id} 
                                    href={`/perfil/${user.id}`}
                                    className="group relative bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 p-3 rounded-xl transition-all duration-300 hover:bg-zinc-900 hover:shadow-lg hover:shadow-white/5 hover:-translate-y-1"
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
                            ))
                        ) : (
                            searchTerm && !isLoading && (
                                <div className="text-center py-10 text-zinc-500 animate-in fade-in slide-in-from-bottom-4">
                                    <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Nenhuma pessoa encontrada.</p>
                                </div>
                            )
                        )}
                    </>
                )}

                {activeTab === 'posts' && (
                    <>
                        {postResults.length > 0 ? (
                            <div className="grid grid-cols-3 gap-1">
                                {postResults.map((post) => (
                                    <Link key={post._id} href={`/p/${post._id}`} className="aspect-square relative group overflow-hidden bg-zinc-900 cursor-pointer">
                                        {post.media.type.startsWith('video/') ? (
                                            <video src={post.media.url} className="w-full h-full object-cover" />
                                        ) : (
                                            <img 
                                                src={post.media.url} 
                                                alt="Resultado" 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            searchTerm && !isLoading && (
                                <div className="col-span-3 text-center py-10 text-zinc-500 animate-in fade-in slide-in-from-bottom-4">
                                    <Grid3X3 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Nenhuma publicação encontrada para "{searchTerm}".</p>
                                </div>
                            )
                        )}
                    </>
                )}

                {!searchTerm && (
                    <div className="text-center py-20 text-zinc-600">
                        <p className="text-sm">
                            {activeTab === 'users' ? "Busque por amigos..." : "Busque por temas (ex: gato, carro)..."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};