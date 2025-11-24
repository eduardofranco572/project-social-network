'use client';

import React, { useState, useEffect } from 'react';
import StatusViewerModal from './StatusViewerModal';
import { StatusUserData } from './types'; 
import { useCurrentUser } from '@/src/hooks/useCurrentUser';

const StatusSkeleton: React.FC = () => {
   return (
        <div className="flex overflow-x-auto gap-4 scrollbar-hide"> 
            {Array.from({ length: 8 }).map((_, index) => (
                <div 
                    key={index} 
                    className="flex flex-col items-center gap-2 w-20 flex-shrink-0 animate-pulse"
                >
                    <div className="w-16 h-16 rounded-full bg-secondary" />
                    <div className="h-4 w-14 rounded bg-secondary" />
                </div>
            ))}
        </div>
    );
};

const StatusCarousel: React.FC = () => {
    const [statusUsers, setStatusUsers] = useState<StatusUserData[]>([]);
    const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user: loggedInUser } = useCurrentUser();

    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const response = await fetch('/api/status');
                if (!response.ok) {
                    throw new Error('Falha ao buscar status');
                }
                const data: StatusUserData[] = await response.json();
                setStatusUsers(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro desconhecido');
            } finally {
                setLoading(false);
            }
        };

        fetchStatuses();
    }, []);

    const openStatus = (index: number) => {
        setSelectedUserIndex(index);
    };

    const closeStatus = () => {
        setSelectedUserIndex(null);
    };

    if (loading) {
        return <StatusSkeleton />;
    }

    if (error) {
        return <div className="p-4 bg-secondary border-border"><p>Erro: {error}</p></div>;
    }

    if (statusUsers.length === 0) {
        return null;
    }

    return (
        <>
            <div className="flex overflow-x-auto gap-4 border-border scrollbar-hide">
                {statusUsers.map((userStatus, index) => (
                    <div 
                        key={userStatus.author.id} 
                        className="flex flex-col items-center gap-2 cursor-pointer w-20 flex-shrink-0"
                        onClick={() => openStatus(index)}
                    >
                        <img 
                            src={userStatus.author.fotoPerfil || '/img/iconePadrao.svg'} 
                            alt={userStatus.author.nome} 
                            className="w-16 h-16 rounded-full border-[2px] border-white p-0.5 object-cover"
                        />

                        <span className="text-sm text-white text-center overflow-hidden text-ellipsis whitespace-nowrap w-full">
                            {userStatus.author.nome}
                        </span>
                    </div>
                ))}
            </div>

            {selectedUserIndex !== null && (
                <StatusViewerModal 
                    allStatusUsers={statusUsers} 
                    startIndex={selectedUserIndex} 
                    onClose={closeStatus} 
                    loggedInUser={loggedInUser}
                />
            )}
        </>
    );
};

export default StatusCarousel;