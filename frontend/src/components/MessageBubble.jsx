// Message bubble component
// Individual message with smooth appearance animation

import { motion } from 'framer-motion';
import UserAvatar from './UserAvatar';
import { useState } from 'react';

function MessageBubble({ message, isOwn, showAvatar, onEdit, onDelete }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`flex items-end gap-2 max-w-[72%] relative ${
        isOwn ? 'flex-row-reverse' : 'flex-row'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
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
        onDoubleClick={
          isOwn && onEdit ? () => onEdit(message) : undefined
        }
        className={`relative px-4 py-2 shadow-sm ${
          isOwn
            ? 'bg-teal-500 text-white rounded-2xl rounded-br-sm shadow-md'
            : 'bg-white text-slate-800 rounded-xl border border-slate-200'
        }`}
      >
        {/* Sender name (only for other users) */}
        {!isOwn && message.sender && (
          <p className="text-xs font-semibold mb-1 text-slate-600">
            {message.sender.username}
          </p>
        )}

        {/* Message text */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.text}
        </p>

        {/* Timestamp */}
        <p className="text-xs mt-1 text-slate-400">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>

        {/* Delete button for own messages */}
        {isOwn && showActions && (
          <button
            onClick={() => onDelete && onDelete(message)}
            className="absolute -top-2 -left-2 text-[10px] px-2 py-1 
                       bg-red-500 text-white rounded shadow-sm hover:bg-red-600"
          >
            Del
          </button>
        )}
      </motion.div>
    </div>
  );
}

export default MessageBubble;
