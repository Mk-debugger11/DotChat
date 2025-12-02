// Sidebar component
// Shows chat list, search, and user info

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '../stores/chatStore';
import { useSocketStore } from '../stores/socketStore';
import { chatAPI, userAPI } from '../utils/api';
import ChatListItem from './ChatListItem';
import SearchBar from './SearchBar';
import UserAvatar from './UserAvatar';

function Sidebar({ onSelectChat, onLogout, currentUser, isConnected }) {
  const { chats, selectedChat, setChats, addChat } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Search users when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers(searchQuery);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  // Search users function
  const searchUsers = async (query) => {
    try {
      const users = await userAPI.searchUsers(query);
      // Filter out current user
      const filtered = users.filter((u) => u.id !== currentUser.id);
      setSearchResults(filtered);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Create or open a 1-on-1 chat
  const handleCreateChat = async (userId) => {
    try {
      const chat = await chatAPI.createChat({
        userId,
        isGroup: false
      });
      addChat(chat);
      onSelectChat(chat);
      setSearchQuery('');
      setShowSearchResults(false);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* User header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar user={currentUser} isOnline={isConnected} size="md" />
          <div>
            <p className="font-semibold text-gray-800">{currentUser.username}</p>
            <p className="text-xs text-gray-500">
              {isConnected ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Logout
        </button>
      </div>

      {/* Search bar */}
      <div className="p-4 border-b border-gray-200 relative">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search users..."
        />

        {/* Search results dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
          >
            {searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => handleCreateChat(user.id)}
                className="w-full p-3 hover:bg-gray-100 flex items-center gap-3 text-left"
              >
                <UserAvatar user={user} size="sm" />
                <span className="font-medium">{user.username}</span>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No chats yet. Search for users to start chatting!
          </div>
        ) : (
          chats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isSelected={selectedChat?.id === chat.id}
              onClick={() => onSelectChat(chat)}
              currentUserId={currentUser.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;

