import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import LockIcon from './LockIcon';

import './Chat.css'
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = "http://localhost:5000";
const socket = io(SOCKET_SERVER_URL);

interface Message {
	id: number;
	username: string;
	content: string;
	timestamp: string;
}

const Chat: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [username, setUsername] = useState<string>('');
	const [content, setContent] = useState<string>('');
	const messagesEndRef = useRef<HTMLDivElement>(null); // Reference to the messages container
	const [scrollLock, setScrollLock] = useState(true);

	// Function to scroll the messages container to the bottom
	const scrollToBottom = () => {
		if (scrollLock && messagesEndRef.current) {
			messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
		}
	};

	const toggleScrollLock = () => {
		const currLock = scrollLock;
		setScrollLock(!scrollLock);
		// setState asynchronous, update scroll off old value
		if (!currLock) {
			scrollToBottom();
		}
	}

	useEffect(() => {
		// get current feed
		axios.get('http://localhost:5000/messages')
			.then(response => {
				setMessages(response.data);
				scrollToBottom(); // Scroll to bottom initially
			});

		//ensure we can receive server side updates
		socket.on('connect', () => {
			console.log("Websocket up");
		});

		socket.on('message', (msg) => {
			//console.log("Received a msg ", msg);
			const newMessage = {
				id: msg['id'],
				username: msg['username'],
				content: msg['content'],
				timestamp: msg['timestamp']
			}
			setMessages(prevMessages => [...prevMessages, newMessage]);
			
			setContent('');
			if (scrollLock) {
				setTimeout(scrollToBottom, 100); // Scroll to our message
			}
		})

		return () => {
			socket.off("message")
		};

	}, [scrollLock]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		//  websocket send
		const msg = {
			username: username,
			content: content,
		}

		socket.send(msg);
		setContent('');
		if (scrollLock) {
			setTimeout(scrollToBottom, 100); // Scroll to our message
		}
	};

	return (
		<div id='chat'>
			<div id='chatheader'>
				<h1>Chat</h1> 
				<div id='scrollLock'>
					<LockIcon locked={scrollLock} toggleLock={toggleScrollLock}/>
				</div>
			</div>
			<div id='messages' ref={messagesEndRef}> {/* Attach ref to the messages container */}
				{messages.map((msg) => (
					<div key={msg.id}>
						<strong>{msg.username.slice(0, 12).padEnd(12, ' ')}</strong>: {msg.content}
					</div>
				))}
			</div>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					required
				/>
				<input
					type="text"
					placeholder="Message"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					required
				/>
				<button type="submit">Send</button>
			</form>
		</div>
	);
};

export default Chat;
