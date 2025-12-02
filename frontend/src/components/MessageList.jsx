// Message list component
// Displays messages in a chat with smooth animations

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { messageAPI } from '../utils/api';
import MessageBubble from './MessageBubble';

function MessageList({ chatId }) {
  const { messages, selectedChat, editMessage, deleteMessage } = useChatStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);

  const [deletingMessage, setDeletingMessage] = useState(null);

  const chatMessages = messages[chatId] || [];

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ---- EDIT MESSAGE ----
  const handleEditMessage = async (message) => {
    const current = message.text || '';
    const next = window.prompt('Edit message:', current);
    if (next == null) return; // cancelled

    const trimmed = next.trim();
    if (!trimmed || trimmed === current) return;

    try {
      const res = await messageAPI.editMessage(message.id, trimmed);

      if (res?.success === false) {
        alert(res.error || 'Failed to edit message');
        return;
      }

      // Update locally
      editMessage(message.id, trimmed);
    } catch (err) {
      console.error('Edit message error:', err);
      alert(err.message || 'Failed to edit message');
    }
  };

  // ---- DELETE MESSAGE ----
  const confirmDeleteMessage = async (message) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      await messageAPI.deleteMessage(message.id);

      // Update local state
      deleteMessage(message.id);
    } catch (err) {
      console.error('Delete message error:', err);
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-6 space-y-3 bg-slate-50">
      {chatMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-slate-500">
          <p className="text-sm">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        chatMessages.map((message, index) => {
          const isOwn = message.senderId === user.id;
          const showAvatar =
            !isOwn &&
            (index === 0 || chatMessages[index - 1].senderId !== message.senderId);

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${
                showAvatar ? 'items-end' : 'items-center'
              }`}
            >
              <MessageBubble
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
                onEdit={isOwn ? handleEditMessage : undefined}
                onDelete={isOwn ? confirmDeleteMessage : undefined}
              />
            </motion.div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
