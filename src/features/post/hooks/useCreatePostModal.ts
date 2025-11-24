"use client";

import { useState, useEffect, useCallback } from 'react';
import { CarouselApi } from "@/components/ui/carousel";
import { useCreatePost } from './useCreatePost';

export const useCreatePostModal = (files: File[], onClose: () => void) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [api, setApi] = useState<CarouselApi>(); 
    const [thumbApi, setThumbApi] = useState<CarouselApi>();
    const [mediaUrls, setMediaUrls] = useState<{ url: string; type: string }[]>([]);
    
    const [hideLikes, setHideLikes] = useState(false);
    const [disableComments, setDisableComments] = useState(false);

    const { description, setDescription, isLoading, handlePost } = useCreatePost();

    useEffect(() => {
        const urls = files.map(file => ({
            url: URL.createObjectURL(file),
            type: file.type
        }));

        setMediaUrls(urls);

        return () => {
            urls.forEach(media => URL.revokeObjectURL(media.url));
        };

    }, [files]);

    const onThumbClick = useCallback((index: number) => {
        if (!api) return;
        api.scrollTo(index);
    }, [api]);

    const onSelect = useCallback(() => {
        if (!api) return;

        const newSelectedIndex = api.selectedScrollSnap();
        setSelectedIndex(newSelectedIndex);
        thumbApi?.scrollTo(newSelectedIndex, true); 

    }, [api, thumbApi]);

    useEffect(() => {
        if (!api) return;

        onSelect();

        api.on("select", onSelect);
        api.on("reInit", onSelect);

        return () => {
            api.off("select", onSelect);
            api.off("reInit", onSelect);
        };

    }, [api, onSelect]);

    const handleSubmit = () => {
        handlePost(files, onClose);
    };

    return {
        mediaUrls,
        selectedIndex,
        setApi,
        setThumbApi,
        onThumbClick,
        description,
        setDescription,
        isLoading,
        handleSubmit,
        hideLikes,
        setHideLikes,
        disableComments,
        setDisableComments
    };
};