import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import LockIcon from './LockIcon';

import './Chat.css'
import { io } from 'socket.io-client';
import TrashIcon from './TrashIcon';
import HealthIcon from './HealthIcon';

const SOCKET_SERVER_URL = "https://nuckchead-be-70d6747d3acd.herokuapp.com/";
const socket = io(SOCKET_SERVER_URL, {transports: ['websocket']});

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

	// drag UI
	const [draggedMsg, setDraggedMsg] = useState<number | null>(null);
	const [mouse, setMouse] = useState<[number, number]>([0, 0]);
	const [dropZone, setDropZone] = useState(0);

	//  websocket
	const [statusColor, setStatusColor] = useState('rgb(255, 0, 0)');

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

	const clearChat = () => {
		const msg = {
			clearChat: '',
		}

		socket.send(msg);
	}

	//  https://dev.to/h8moss/build-a-reorderable-list-in-react-29on
	const _reorderListForward = <T,>(l: T[], start: number, end: number) => {
		const temp = l[start];
		for (let i=start; i<end; i++) {
			l[i] = l[i+1];
		}
		l[end - 1] = temp;

		return l;
	};

	const _reorderListBackward = <T,>(l: T[], start: number, end: number) => {
		const temp = l[start];
	  
		for (let i = start; i > end; i--) {
		  l[i] = l[i - 1];
		}
	  
		l[end] = temp;
	  
		return l;
	  };
	  
	const reorderList = <T,>(l: T[], start: number, end: number) => {
		if (start < end) return _reorderListForward([...l], start, end);
		else if (start > end) return _reorderListBackward([...l], start, end);
	  
		return l; // if start == end
	};

	useEffect(() => {
		// get current feed
		axios.get('https://nuckchead-be-70d6747d3acd.herokuapp.com/messages')
			.then(response => {
				setMessages(response.data);
				scrollToBottom(); // Scroll to bottom initially
			});

		const handleConnect = () => {
			setStatusColor('rgb(0, 255, 0)');
		};

		const handleDisconnect = () => {
			setStatusColor('rgb(255, 0, 0)');
		}

		socket.on('connect', handleConnect);
		socket.on('disconnect', handleDisconnect);

		socket.on('heartbeat', (msg) => {
			console.log(msg, 'hbt');
		})

		socket.on('message', (msg) => {
			console.log("Received msg type", msg['type']);
			switch (msg['type']) {
				case 'chat':
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
					break;
				case 'clearChat':
					setMessages([]);
					break;
				default:
					console.log("Unknown type", msg['type']);
					break;
			}
		})

		return () => {
			socket.off('connect', handleConnect);
			socket.off('disconnect', handleDisconnect);
			socket.off("message");
		};
	}, [])

	useEffect(() => {
		//  mouse movement handler for drag and drop
		const dragHandler = (e: MouseEvent) => {
			setMouse([e.x, e.y]);
		};

		const dropHandler = (e: MouseEvent) => {
			if (draggedMsg !== null) {
				e.preventDefault();
				setDraggedMsg(null);
				const msg = {
					pos1: messages[draggedMsg].id,
					pos2: dropZone,
				}

				socket.send(msg);
				setMessages((messages) => reorderList([...messages], draggedMsg, dropZone));
			}
		};

		document.addEventListener("mousemove", dragHandler);
		document.addEventListener("mouseup", dropHandler);
	
		// get closest drop zone
		if (draggedMsg !== null) {
			// get all drop-zones
			const elements = Array.from(document.getElementsByClassName("drop-zone"));
			// get all drop-zones' y-axis position
			// if we were using a horizontally-scrolling list, we would get the .left property
			const positions = elements.map((e) => e.getBoundingClientRect().top);
			// get the difference with the mouse's y position
			const absDifferences = positions.map((v) => Math.abs(v - mouse[1]));
	  
			// get the item closest to the mouse
			let result = absDifferences.indexOf(Math.min(...absDifferences));
	  
			// if the item is below the dragged item, add 1 to the index
			if (result > draggedMsg) result += 1;
	  
			setDropZone(result);
		}

		return () => {
			document.removeEventListener("mousemove", dragHandler);
			document.removeEventListener("mouseup", dropHandler);
		};

	}, [scrollLock, draggedMsg, mouse]);

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
				<div id='healthicon'>
					<HealthIcon color={statusColor}/>
				</div>
				<div id='trash'>
					<TrashIcon onTrashClick={clearChat}/>
				</div>
				<div id='scrollLock'>
					<LockIcon locked={scrollLock} toggleLock={toggleScrollLock}/>
				</div>
			</div>
			<div id='messages' ref={messagesEndRef}> {/* Attach ref to the messages container */}
				{draggedMsg !== null && (
					<div className="floating msg-list-item"
					style={{
						left: `${mouse[0]}px`,
						top: `${mouse[1]}px`,
					}}>
					{messages[draggedMsg].content}</div>
				)}

				<div className={`msg-list-item drop-zone ${draggedMsg === null || dropZone !== 0 ? "hidden" : ""}`}></div>
				{messages.map((msg, index) => (
					<>
						{draggedMsg !== index && (
							<>
								<div key={msg.id}
									className="msg-list-item"
									onMouseDown={(e) => {
										e.preventDefault();
										setDraggedMsg(index);
									}}>
									<strong>{msg.username}</strong>: {msg.content}
								</div>
								<div className={`msg-list-item drop-zone ${draggedMsg === null || dropZone !== index+1 ? "hidden" : ""}`}></div>
							</>
						)}

					</>
				))}
			</div>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					maxLength={20}
					required
				/>
				<input
					type="text"
					placeholder="Message"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					maxLength={200}
					required
				/>
				<button type="submit" className="hidden">Send</button>
			</form>
		</div>
	);
};

export default Chat;
