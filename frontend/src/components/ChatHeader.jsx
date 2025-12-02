// Chat header component
// Shows chat name and participants

import { useAuthStore } from '../stores/authStore';
import UserAvatar from './UserAvatar';

function ChatHeader({ chat }) {
  const { user: currentUser } = useAuthStore();

  // Get chat name (for group chats) or other user's name (for 1-on-1)
  const getChatName = () => {
    if (chat.isGroup && chat.name) {
      return chat.name;
    }

    // For 1-on-1, find the other user (not current user)
    if (chat.members && currentUser) {
      const otherMember = chat.members.find(
        (m) => m.userId !== currentUser.id
      );
      return otherMember?.user?.username || 'Chat';
    }

    return 'Chat';
  };

  // Get other user for 1-on-1 chats
  const getOtherUser = () => {
    if (chat.isGroup || !chat.members || !currentUser) return null;
    const otherMember = chat.members.find((m) => m.userId !== currentUser.id);
    return otherMember?.user || null;
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
      {/* Chat avatar or other user's avatar */}
      {chat.isGroup ? (
        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
          {chat.name?.charAt(0).toUpperCase() || 'G'}
        </div>
      ) : (
        getOtherUser() && <UserAvatar user={getOtherUser()} size="md" />
      )}

      <div>
        <h2 className="font-semibold text-gray-800">{getChatName()}</h2>
        {chat.isGroup && (
          <p className="text-xs text-gray-500">
            {chat.members?.length || 0} members
          </p>
        )}
      </div>
    </div>
  );
}

export default ChatHeader;

