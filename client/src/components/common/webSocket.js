import React, { useRef, useState } from "react";
import { io } from "socket.io-client";
import { WS_BASE_URL } from '../../utils/constant';

export const useWebSocket = (orderId) => {
    const [riderLocation, setRiderLocation] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!orderId) return;

        socketRef.current = io(`${WS_BASE_URL}/delivery`, {
            query: { orderId },
            withCredentials: true,
        });

        socketRef.current.on('connect', () => {
            setIsConnected(true);
            socketRef.current.emit('join_delivery', { orderId });
            console.log('Connected to WebSocket server');
        });

        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from WebSocket server');
        });

        socketRef.current.on('rider_location', (data) => {
            setRiderLocation(data);
            console.log('Rider location:', data);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [orderId]);

    return { riderLocation, isConnected };
}

export default socket; 
