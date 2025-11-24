"use client";

import { useState, useEffect, useRef } from 'react';
import { CarouselApi } from "@/components/ui/carousel";
import Swal from 'sweetalert2';
import { useDeletePost } from './useDeletePost';
import { useIntersectionObserver } from './useIntersectionObserver';
import { PostWithAuthor } from '../components/types';

export const usePostCard = (post: PostWithAuthor, onDeleteSuccess: () => void) => {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);
    const [isMuted, setIsMuted] = useState(true);

    const { isDeleting, handleDeletePost } = useDeletePost();
    const cardRef = useRef<HTMLElement>(null);
    
    const isCardVisible = useIntersectionObserver(cardRef as any, { threshold: 0.5 });

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

    const handleCopyLink = () => {
        const postUrl = typeof window !== 'undefined' 
            ? `${window.location.origin}/p/${post._id}` 
            : `/p/${post._id}`;
            
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

    const handleDelete = () => {
        handleDeletePost(post._id, onDeleteSuccess);
    };

    return {
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
    };
};