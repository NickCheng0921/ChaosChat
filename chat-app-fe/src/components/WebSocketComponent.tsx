import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = "http://localhost:5000";
const socket = io(SOCKET_SERVER_URL);

const WebSocketComponent: React.FC = () => {
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        // Connect to the WebSocket server

        //const socket = io(SOCKET_SERVER_URL, {transports: ['websocket']});
		//socket.disconnect();

        socket.on('connect', () => {
			console.log("Connected");
            setMessage('Connected to WebSocket server');
			socket.send('wasssup');
		});

        // Cleanup on component unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div>
            <h1>WebSocket Message</h1>
            <p>{message}</p>
        </div>
    );
}

export default WebSocketComponent;
