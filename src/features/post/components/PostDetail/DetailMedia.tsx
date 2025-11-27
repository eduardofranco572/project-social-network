import React from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { MediaItem } from '../types';
import { usePostMedia } from '../../hooks/usePostMedia';

interface DetailMediaProps {
    media: MediaItem;
    isVisible: boolean;
    isMuted: boolean;
    toggleMute: () => void;
}

export const DetailMedia: React.FC<DetailMediaProps> = ({ media, isVisible, isMuted, toggleMute }) => {
    const { videoRef, userPaused, isVideo, togglePlay } = usePostMedia(
        media, isVisible, true, isMuted
    );

    if (isVideo) {
        return (
            <div className="relative w-full h-full bg-black flex items-center justify-center" onClick={togglePlay}>
                <video
                    ref={videoRef}
                    src={media.url}
                    loop
                    playsInline
                    className="max-h-full w-auto max-w-full object-contain cursor-pointer" 
                />

                {userPaused && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-20">
                        <Play className="h-20 w-20 text-white/90" fill="white" />
                    </div>
                )}

                <button 
                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                    className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-30"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-black flex items-center justify-center">
            <img 
                src={media.url} 
                alt="Post Content" 
                className="max-h-full w-auto max-w-full object-contain"
            />
        </div>
    );
};