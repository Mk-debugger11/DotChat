// Group Message Input component
// Input field for sending group messages

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useGroupStore } from '../stores/groupStore';
import { groupAPI } from '../utils/api';

function GroupMessageInput({ groupId, socket }) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const { addGroupMessage } = useGroupStore();
  const { user } = useAuthStore();

  // Handle send message
  const handleSend = async (e) => {
    e.preventDefault();

    if (!content.trim() || sending) return;

    const messageContent = content.trim();
    setContent('');
    setSending(true);

    try {
      // Send message via API
      const message = await groupAPI.sendGroupMessage(groupId, messageContent);

      // Add message to store (will also be received via socket)
      addGroupMessage(groupId, {
        ...message,
        sender: {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        }
      });

      // Emit via socket for real-time delivery
      if (socket) {
        socket.emit('sendGroupMessage', {
          groupId,
          content: messageContent
        });
      }
    } catch (error) {
      console.error('Error sending group message:', error);
      // Restore content on error
      setContent(messageContent);
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
    <div className="bg-white border-t border-slate-200 px-4 py-3">
      <form onSubmit={handleSend} className="flex items-end gap-3 max-w-4xl mx-auto">
        {/* Text input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none text-sm"
          style={{ maxHeight: '120px' }}
        />

        {/* Send button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={!content.trim() || sending}
          className="bg-teal-500 text-white px-6 py-2 rounded-full text-sm font-medium shadow-md hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Sending...' : 'Send'}
        </motion.button>
      </form>
    </div>
  );
}

export default GroupMessageInput;

