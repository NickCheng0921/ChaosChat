import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

  useEffect(() => {
    axios.get('http://localhost:5000/messages')
      .then(response => {
        setMessages(response.data);
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
      });
  };

  return (
    <div>
      <h1>Chat</h1>
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.username}</strong>: {msg.content} <em>{new Date(msg.timestamp).toLocaleString()}</em>
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
