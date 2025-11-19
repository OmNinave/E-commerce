import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/ChatAssistant.css';

export default function ChatAssistant() {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! 👋 How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // TODO: Replace with actual API call to ChatAssistant backend
      // const response = await fetch('/api/chat/messages', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     message: inputValue,
      //     userId: user?.id,
      //     conversationId: conversationId
      //   })
      // });

      // For now, simulate a bot response
      const botResponse = {
        id: userMessage.id + 1,
        type: 'bot',
        text: 'I\'m here to help! This feature is coming soon. In the meantime, please check our FAQ or contact support.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: userMessage.id + 1,
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    const quickMessages = {
      orders: 'I want to check my orders',
      products: 'Show me available products',
      shipping: 'What is your shipping policy?',
      returns: 'How do I return an item?'
    };

    if (quickMessages[action]) {
      setInputValue(quickMessages[action]);
    }
  };

  return (
    <>
      {/* Chat Assistant Button */}
      <button
        className="chat-assistant-button"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-assistant-window">
          <div className="chat-header">
            <h3>Chat Assistant</h3>
            <button
              className="chat-close-button"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 1 && !loading && (
              <div className="quick-actions">
                <h4>How can we help?</h4>
                <button
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('orders')}
                >
                  📦 My Orders
                </button>
                <button
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('products')}
                >
                  🛒 Browse Products
                </button>
                <button
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('shipping')}
                >
                  🚚 Shipping Info
                </button>
                <button
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('returns')}
                >
                  ↩️ Returns & Refunds
                </button>
              </div>
            )}

            {messages.map(message => (
              <div
                key={message.id}
                className={`message ${message.type}`}
              >
                {message.type === 'bot' && (
                  <div className="message-avatar">🤖</div>
                )}
                <div className="message-content">
                  <p>{message.text}</p>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {message.type === 'user' && (
                  <div className="message-avatar">👤</div>
                )}
              </div>
            ))}

            {loading && (
              <div className="message bot">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="chat-send-button"
            >
              Send
            </button>
          </form>

          <div className="chat-footer">
            {!user && (
              <p className="footer-note">Please log in to chat with us</p>
            )}
            <p className="footer-note">Available 24/7 for your support</p>
          </div>
        </div>
      )}
    </>
  );
}
