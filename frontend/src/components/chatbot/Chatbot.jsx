import React, { useState } from 'react';
import './Chatbot.css';
import agentAvatar from './keshav.jpg';


const ChatBot = () => {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Radhe Radhe! What happened dear?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userInput = input;
    setMessages(prev => [...prev, { from: 'user', text: userInput }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
      });
      const data = await response.json();

      if (data.response) {
        setMessages(prev => [...prev, { from: 'bot', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { from: 'bot', text: 'Hmm... something went wrong on the server.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { from: 'bot', text: 'Sorry, I could not connect to the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container" style={{ backgroundColor: 'blue', borderRadius: '10px', padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <div className="chat-header">
        <img src={agentAvatar} alt="Keshav Avatar" className="agent-avatar" />
        <span className="agent-name">Keshav</span>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.from}`}>{msg.text}</div>
        ))}
        {loading && <div className="message bot typing">Keshav is thinking...</div>}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your thoughts..."
          aria-label="User message"
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} disabled={loading}>Send</button>
      </div>
    </div>
  );
};

export default ChatBot;