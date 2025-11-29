"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const useSocket = (userId?: number) => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!socket) {
            socket = io('http://localhost:3001', {
                transports: ['websocket'],
                reconnection: true,
            });
        }

        function onConnect() {
            setIsConnected(true);
            if (userId) {
                socket.emit('join_room', userId);
            }
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        if (socket.connected) { 
            onConnect();
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, [userId]);

    return { socket, isConnected };
};