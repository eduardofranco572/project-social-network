"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { PostWithAuthor } from '@/src/features/post/components/types';

export const useExplorePosts = (limit: number = 15) => {
    const [posts, setPosts] = useState<PostWithAuthor[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    
    const observer = useRef<IntersectionObserver | null>(null);

    const fetchExplore = useCallback(async (pageNum: number) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/explore?page=${pageNum}&limit=${limit}`);
            if (!response.ok) throw new Error('Falha ao buscar posts');
            
            const data = await response.json();
            
            setPosts(prev => {
                const newPosts = data.posts.filter((p: PostWithAuthor) => 
                    !prev.some(existing => existing._id === p._id)
                );
                return [...prev, ...newPosts];
            });

            if (data.posts.length < limit) {
                setHasMore(false);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchExplore(page);
    }, [page, fetchExplore]);

    const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoading) return;
        
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);

    return {
        posts,
        isLoading,
        hasMore,
        lastPostElementRef
    };
};