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
      whileHover={{ backgroundColor: '#f3f4f6' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {chat.isGroup ? (
          <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
            {chat.name?.charAt(0).toUpperCase() || 'G'}
          </div>
        ) : (
          <UserAvatar user={getChatAvatar()} size="md" />
        )}

        {/* Chat info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-800 truncate">
              {getChatName()}
            </h3>
            {latestMessage && (
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {new Date(latestMessage.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
          {latestMessage && (
            <p className="text-sm text-gray-600 truncate">
              <span className="font-medium">
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

