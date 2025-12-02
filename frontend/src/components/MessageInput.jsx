import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { messageAPI } from '../utils/api';

function MessageInput({ chatId, socket }) {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    let typingTimeout;

    if (text.trim() && socket) {
      socket.emit('typing', { chatId, isTyping: true });
      setIsTyping(true);

      if (typingTimeout) clearTimeout(typingTimeout);
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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    const messageText = text.trim();
    setText('');
    setSending(true);

    try {
      // Call API only. Backend will create message and emit 'receiveMessage'.
      await messageAPI.sendMessage(chatId, messageText);
      // DO NOT add message locally here; socket will deliver it.
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore text if error
      setText(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 px-4 py-3">
      <form onSubmit={handleSend} className="flex items-end gap-3 max-w-4xl mx-auto">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none text-sm"
          style={{ maxHeight: '120px' }}
        />

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={!text.trim() || sending}
          className="bg-teal-500 text-white px-6 py-2 rounded-full text-sm font-medium shadow-md hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Sending...' : 'Send'}
        </motion.button>
      </form>
    </div>
  );
}

export default MessageInput;
