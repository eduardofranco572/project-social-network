"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { StatusUserData } from '../components/types';

const STATUS_DURATION_MS = 5000;

export const useStatusViewer = (
    allStatusUsers: StatusUserData[], 
    startIndex: number, 
    onClose: () => void
) => {
    const [currentUserIndex, setCurrentUserIndex] = useState(startIndex);
    const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [videoProgress, setVideoProgress] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const currentUser = allStatusUsers[currentUserIndex];
    const currentStatus = currentUser?.statuses[currentStatusIndex];
    const isVideo = currentStatus?.mediaType.startsWith('video/');

    // Navegação
    const navigateNextUser = useCallback(() => {
        if (currentUserIndex < allStatusUsers.length - 1) {
            setCurrentUserIndex(prev => prev + 1);
            setCurrentStatusIndex(0);
        } else {
            onClose();
        }

    }, [currentUserIndex, allStatusUsers.length, onClose]);

    const navigatePrevUser = useCallback(() => {
        if (currentUserIndex > 0) {
            setCurrentUserIndex(prev => prev - 1);
            const prevUserStatusCount = allStatusUsers[currentUserIndex - 1]?.statuses.length || 1;
            setCurrentStatusIndex(prevUserStatusCount - 1);
        }

    }, [currentUserIndex, allStatusUsers]);

    const navigateNextStatus = useCallback(() => {
        if (currentUser && currentStatusIndex < currentUser.statuses.length - 1) {
            setCurrentStatusIndex(prev => prev + 1);
        } else {
            navigateNextUser();
        }

    }, [currentUser, currentStatusIndex, navigateNextUser]);

    const navigatePrevStatus = useCallback(() => {
        if (currentStatusIndex > 0) {
            setCurrentStatusIndex(prev => prev - 1);
        } else {
            navigatePrevUser();
        }

    }, [currentStatusIndex, navigatePrevUser]);


    // Controles de Mídia
    const pause = () => {
        setIsPaused(true);
    };

    const play = useCallback(() => {
        setIsPaused(false);
    }, []);

    const toggleMute = () => {
        setIsMuted(m => !m);
    };
    
    const handleTimeUpdate = () => {
        if (videoRef.current && !videoRef.current.paused) {
            const { currentTime, duration } = videoRef.current;
            if (duration > 0) {
                setVideoProgress((currentTime / duration) * 100);
            }
        }
    };

    const autoAdvance = useCallback(() => {
        setIsPaused(false);
        setVideoProgress(0);
        navigateNextStatus();
    }, [navigateNextStatus]);
    
    const handleVideoEnd = () => {
        autoAdvance();
    };

    const manualNextStatus = () => {
        setVideoProgress(0);
        navigateNextStatus();
    };

    const manualPrevStatus = () => {
        setVideoProgress(0);
        navigatePrevStatus();
    };

    const manualNextUser = () => {
        setVideoProgress(0);
        navigateNextUser();
    };

    const manualPrevUser = () => {
        setVideoProgress(0);
        navigatePrevUser();
    };


    // Efeitos
    useEffect(() => {
        if (!currentStatus) return;

        if (isVideo && videoRef.current) {
            videoRef.current.src = currentStatus.mediaUrl;
            videoRef.current.load();
        }
    }, [currentStatus, isVideo]);

    // Controla Play/Pause
    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);

        if (isPaused) {
            if (isVideo && videoRef.current) {
                videoRef.current.pause();
            }
            return;
        }

        if (isVideo && videoRef.current) {
            videoRef.current.play().catch(console.error);

        } else if (!isVideo) {
            timerRef.current = setTimeout(autoAdvance, STATUS_DURATION_MS);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
        
    }, [currentStatus, isPaused, isVideo, autoAdvance]);

    useEffect(() => {
        if (isVideo && videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted, currentStatus, isVideo]);


    return {
        currentUser,
        currentStatus,
        currentStatusIndex,
        isVideo,
        isPaused,
        isMuted,
        videoRef,
        pause,
        play,
        toggleMute,
        handleVideoEnd,
        STATUS_DURATION_MS,
        videoProgress,
        handleTimeUpdate,
        onClickNextStatus: manualNextStatus,
        onClickPrevStatus: manualPrevStatus,
        onClickNextUser: manualNextUser,
        onClickPrevUser: manualPrevUser,
    };
};