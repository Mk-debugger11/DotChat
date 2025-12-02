// Message list component
// Displays messages in a chat with smooth animations

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import MessageBubble from './MessageBubble';

function MessageList({ chatId }) {
  const { messages, selectedChat } = useChatStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);
  const chatMessages = messages[chatId] || [];

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-2">
      {chatMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No messages yet. Start the conversation!</p>
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
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${
                showAvatar ? 'items-end' : 'items-center'
              }`}
            >
              <MessageBubble
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
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

