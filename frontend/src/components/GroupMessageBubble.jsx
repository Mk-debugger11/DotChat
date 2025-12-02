// Group Message Bubble component
// Individual group message with sender name and avatar

import { motion } from 'framer-motion';
import UserAvatar from './UserAvatar';

function GroupMessageBubble({ message, isOwn, showAvatar }) {
  return (
    <div
      className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar (only show for other users' messages) */}
      {!isOwn && showAvatar && (
        <div className="flex-shrink-0">
          <UserAvatar user={message.sender} size="sm" />
        </div>
      )}

      {/* Message bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`rounded-lg px-4 py-2 ${
          isOwn
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-800 border border-gray-200'
        }`}
      >
        {/* Sender name (always show for group messages, except own) */}
        {!isOwn && message.sender && (
          <p className="text-xs font-semibold mb-1 opacity-80">
            {message.sender.username}
          </p>
        )}

        {/* Message content */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>

        {/* Timestamp */}
        <p
          className={`text-xs mt-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </motion.div>
    </div>
  );
}

export default GroupMessageBubble;

