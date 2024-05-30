import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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

  useEffect(() => {
    axios.get('http://localhost:5000/messages')
      .then(response => {
        setMessages(response.data);
        scrollToBottom(); // Scroll to bottom initially
      });
  }, []);

  // Function to scroll the messages container to the bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

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
        setTimeout(scrollToBottom, 100); // Scroll to bottom after adding new message
      });
  };

  return (
    <div id='chat'>
      <h1>Chat</h1>
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
