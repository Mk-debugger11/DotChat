// Message input component
// Input field with send button and typing indicator

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { messageAPI } from '../utils/api';

function MessageInput({ chatId, socket }) {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const { addMessage } = useChatStore();
  const { user } = useAuthStore();

  // Typing indicator timeout
  useEffect(() => {
    let typingTimeout;

    if (text.trim() && socket) {
      // Emit typing start
      socket.emit('typing', { chatId, isTyping: true });
      setIsTyping(true);

      // Clear previous timeout
      if (typingTimeout) clearTimeout(typingTimeout);

      // Stop typing after 2 seconds of no input
      typingTimeout = setTimeout(() => {
        socket.emit('typing', { chatId, isTyping: false });
        setIsTyping(false);
      }, 2000);
    } else if (socket) {
      socket.emit('typing', { chatId, isTyping: false });
      setIsTyping(false);
    }

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [text, chatId, socket]);

  // Handle send message
  const handleSend = async (e) => {
    e.preventDefault();

    if (!text.trim() || sending) return;

    const messageText = text.trim();
    setText('');
    setSending(true);

    try {
      // Send message via API
      const message = await messageAPI.sendMessage(chatId, messageText);

      // Add message to store (will also be received via socket)
      addMessage(chatId, {
        ...message,
        sender: {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        }
      });

      // Emit via socket for real-time delivery
      if (socket) {
        socket.emit('sendMessage', {
          chatId,
          text: messageText
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore text on error
      setText(messageText);
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key (send) or Shift+Enter (new line)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <form onSubmit={handleSend} className="flex items-end gap-2">
        {/* Text input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          style={{ maxHeight: '120px' }}
        />

        {/* Send button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={!text.trim() || sending}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Sending...' : 'Send'}
        </motion.button>
      </form>
    </div>
  );
}

export default MessageInput;

