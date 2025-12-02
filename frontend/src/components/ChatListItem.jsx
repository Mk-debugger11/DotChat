// Chat list item component
// Shows a single chat in the sidebar list

import { motion } from 'framer-motion';
import UserAvatar from './UserAvatar';

function ChatListItem({ chat, isSelected, onClick, currentUserId }) {
  // Get the latest message
  const latestMessage = chat.messages?.[0];

  // Get chat display name
  const getChatName = () => {
    if (chat.isGroup && chat.name) {
      return chat.name;
    }

    // For 1-on-1, find the other user
    if (chat.members) {
      const otherMember = chat.members.find(
        (m) => m.userId !== currentUserId
      );
      return otherMember?.user?.username || 'Chat';
    }

    return 'Chat';
  };

  // Get chat avatar
  const getChatAvatar = () => {
    if (chat.isGroup) {
      return null; // Group chat - show group icon
    }

    // For 1-on-1, get other user
    if (chat.members) {
      const otherMember = chat.members.find(
        (m) => m.userId !== currentUserId
      );
      return otherMember?.user;
    }

    return null;
  };

  return (
    <motion.div
      whileHover={{ backgroundColor: '#ecfeff' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`px-4 py-3 border-b border-slate-100 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-teal-100 border-l-4 border-teal-500'
          : 'hover:bg-teal-50'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {chat.isGroup ? (
          <div className="w-11 h-11 rounded-2xl bg-teal-500 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-md">
            {chat.name?.charAt(0).toUpperCase() || 'G'}
          </div>
        ) : (
          <UserAvatar user={getChatAvatar()} size="md" />
        )}

        {/* Chat info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-slate-800 truncate">
              {getChatName()}
            </h3>
            {latestMessage && (
              <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                {new Date(latestMessage.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
          {latestMessage && (
            <p className="text-xs text-slate-500 truncate">
              <span className="font-medium text-slate-700">
                {latestMessage.sender?.username}:
              </span>{' '}
              {latestMessage.text}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ChatListItem;

