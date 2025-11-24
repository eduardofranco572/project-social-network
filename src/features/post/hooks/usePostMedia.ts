"use client";

import { useState, useEffect, useRef } from 'react';
import { MediaItem } from '../components/types';

export const usePostMedia = (
    media: MediaItem,
    isSlideVisible: boolean,
    isCardVisible: boolean,
    isMuted: boolean
) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [userPaused, setUserPaused] = useState(false);
    const isVideo = media.type.startsWith('video/');

    const isActuallyVisible = isCardVisible && isSlideVisible;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const shouldPlay = isActuallyVisible && !userPaused;

        if (shouldPlay) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }

        if (!isActuallyVisible) {
            video.currentTime = 0;
            setUserPaused(false);
        }
        
    }, [isActuallyVisible, userPaused]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    const togglePlay = () => {
        if (isActuallyVisible) {
            setUserPaused(prev => !prev);
        }
    };

    return {
        videoRef,
        userPaused,
        isVideo,
        togglePlay
    };
};