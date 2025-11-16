'use client';

import React from 'react';
import { StatusUserData } from './types'; 
import { useStatusViewer } from '@/src/features/status/hooks/useStatusViewer';
import { useDeleteStatus } from '@/src/features/status/hooks/useDeleteStatus'; 
import { Play, Pause, Volume2, VolumeX, X, MoreVertical, Trash2 } from 'lucide-react'; 
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button'; 
import '@/app/css/status-viewer.css';

interface StatusViewerModalProps {
    allStatusUsers: StatusUserData[];
    startIndex: number;
    onClose: () => void;
    loggedInUser: { id: number } | null;
}

const StatusViewerModal: React.FC<StatusViewerModalProps> = ({ allStatusUsers, startIndex, onClose, loggedInUser }) => {
    const {
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
        onClickNextStatus,
        onClickPrevStatus,
        onClickNextUser,
        onClickPrevUser
    } = useStatusViewer(allStatusUsers, startIndex, onClose);

    const { isDeleting, handleDelete } = useDeleteStatus()

    if (!currentUser || !currentStatus) {
        return null;
    }

    const isAuthor = loggedInUser?.id === currentUser.author.id;

    const onDelete = () => {
        handleDelete(currentStatus._id, onClickNextUser);
    };

    return (
        <div className="status-viewer-overlay" onClick={onClose}>
            
            <div 
                className="status-nav-arrow prev"
                onClick={(e) => { e.stopPropagation(); onClickPrevUser(); }}
            >
                &#8249;
            </div>

            <div 
                className="status-viewer-content" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="status-viewer-body">

                    <div className="status-media-container">
                        <div 
                            className="status-click-zone prev" 
                            onClick={onClickPrevStatus} 
                        >
                        </div>
  
                        <div 
                            className="status-click-zone next" 
                            onClick={onClickNextStatus} 
                        >
                        </div>

                        {isVideo ? (
                            <video
                                ref={videoRef}
                                playsInline
                                onEnded={handleVideoEnd}
                                onTimeUpdate={handleTimeUpdate}
                                className="status-media-item"
                            />
                        ) : (
                            <img src={currentStatus.mediaUrl} alt="Status" className="status-media-item" />
                        )}
                    </div>

                    <div className="status-header">
                        <div className="status-header-info">
                            <div className="status-author-details">
                                <img src={currentUser.author.fotoPerfil || '/img/iconePadrao.svg'} alt={currentUser.author.nome} className="status-author-avatar" />
                                <h2 className="status-author-name">{currentUser.author.nome}</h2>
                            </div>

                            <div className="status-header-controls">
                                {isVideo && (
                                    <button onClick={toggleMute} className="status-control-button">
                                        {isMuted ? <VolumeX /> : <Volume2 />}
                                    </button>
                                )}

                                {isPaused ? (
                                    <button onClick={play} className="status-control-button">
                                        <Play />
                                    </button>
                                ) : (
                                    <button onClick={pause} className="status-control-button">
                                        <Pause />
                                    </button>
                                )}

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="status-control-button">
                                            <MoreVertical />
                                        </button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent className="mr-4">
                                        {isAuthor && (
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onSelect={onDelete}
                                                disabled={isDeleting}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                {isDeleting ? 'Excluindo...' : 'Excluir'}
                                            </DropdownMenuItem>
                                        )}
                                        
                                        {!isAuthor && (
                                            <DropdownMenuItem onSelect={() => console.log('Denunciado!')}>
                                                Denunciar
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <button onClick={onClose} className="status-control-button">
                                    <X strokeWidth={3} />
                                </button>
                            </div>
 
                        </div>

                        <div className="status-progress-container">
                            {currentUser.statuses.map((status, index) => (
                                <div key={status._id} className="status-progress-bar">
                                    <div 
                                        className="status-progress-fill"
                                        style={{
                                            width: index < currentStatusIndex ? '100%' :
                                                   index === currentStatusIndex ? 
                                                      (isVideo ? `${videoProgress}%` : '0%')
                                                      : '0%', 

                                            ...(index === currentStatusIndex && !isVideo && {
                                                animation: `fillBar ${STATUS_DURATION_MS}ms linear forwards`,
                                                animationPlayState: isPaused ? 'paused' : 'running',
                                            })
                                        } as any } 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {currentStatus.description && (
                        <div className="status-description">
                            <p>{currentStatus.description}</p>
                        </div>
                    )}
                </div>
            </div>

            <div 
                className="status-nav-arrow next"
                onClick={(e) => { e.stopPropagation(); onClickNextUser(); }}
            >
                &#8250;
            </div>
        </div>
    );
};

export default StatusViewerModal;