// Group Chat Window component
// Main interface for group chat with messages and input

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGroupStore } from '../stores/groupStore';
import { useAuthStore } from '../stores/authStore';
import { groupAPI } from '../utils/api';
import GroupMessageBubble from './GroupMessageBubble';
import GroupMessageInput from './GroupMessageInput';

function GroupChatWindow({ groupId, socket }) {
  const { groupMessages, setGroupMessages } = useGroupStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);
  const messages = groupMessages[groupId] || [];

  // Load messages when group is selected
  useEffect(() => {
    if (groupId) {
      loadMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages function
  const loadMessages = async () => {
    try {
      const data = await groupAPI.getGroupMessages(groupId);
      setGroupMessages(groupId, data.messages);
    } catch (error) {
      console.error('Error loading group messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.senderId === user.id;
            const showAvatar =
              !isOwn &&
              (index === 0 || messages[index - 1].senderId !== message.senderId);

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <GroupMessageBubble
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

      {/* Message input */}
      <GroupMessageInput groupId={groupId} socket={socket} />
    </div>
  );
}

export default GroupChatWindow;

