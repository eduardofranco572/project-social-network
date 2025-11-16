"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { PostWithAuthor } from '../components/types';

export const usePosts = (limit: number = 15) => {
    const [posts, setPosts] = useState<PostWithAuthor[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    
    const observer = useRef<IntersectionObserver | null>(null);

    const fetchPosts = useCallback(async (pageNum: number) => {
        if (isLoading || !hasMore) return;
        
        setIsLoading(true);
        try {
            const response = await fetch(`/api/post?page=${pageNum}&limit=${limit}`);
            if (!response.ok) {
                throw new Error('Falha ao buscar posts');
            }
            
            const data = await response.json();
            
            setPosts(prevPosts => {
                const newPosts = data.posts.filter((newPost: PostWithAuthor) => 
                    !prevPosts.some(prevPost => prevPost._id === newPost._id)
                );
                return [...prevPosts, ...newPosts];
            });
            
            setHasMore(data.hasMore);

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, limit]);

    // Hook para o IntersectionObserver
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

    useEffect(() => {
        fetchPosts(page);
    }, [page, fetchPosts]); 

    return {
        posts,
        isLoading,
        hasMore,
        lastPostElementRef
    };
};