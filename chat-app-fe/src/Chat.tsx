import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import LockIcon from './components/LockIcon';
import './Chat.css'

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
    if (messagesEndRef.current) {
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
    axios.get('http://localhost:5000/messages')
      .then(response => {
        setMessages(response.data);
        scrollToBottom(); // Scroll to bottom initially
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post('http://localhost:5000/messages', { username, content })
      .then(response => {
        setMessages([...messages, {
          id: response.data.id,
          username,
          content,
          timestamp: response.data.timestamp
        }]);
        setContent('');
        if (scrollLock) {
          setTimeout(scrollToBottom, 100); // Scroll to our message
        }
        
      });
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
