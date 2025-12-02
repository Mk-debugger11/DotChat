// Main chat page
// 2-column layout with sidebar and chat area
// Supports both 1-on-1 chats and group chats

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { useGroupStore } from '../stores/groupStore';
import { useSocketStore } from '../stores/socketStore';
import { chatAPI, messageAPI, groupAPI } from '../utils/api';
import Sidebar from '../components/Sidebar';
import GroupListSidebar from '../components/GroupListSidebar';
import CreateGroupModal from '../components/CreateGroupModal';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import GroupChatWindow from '../components/GroupChatWindow';

function ChatPage() {
  const { user, logout } = useAuthStore();
  const { selectedChat, setSelectedChat, setChats, setMessages, addMessage } = useChatStore();
  const {
    selectedGroup,
    setSelectedGroup,
    setGroups,
    addGroup,
    addGroupMessage,
    setGroupMessages
  } = useGroupStore();
  const { socket, connect, disconnect, isConnected } = useSocketStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'groups'
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  // Initialize socket connection and load chats/groups
  useEffect(() => {
    // Connect to socket
    connect();

    // Load chats and groups
    loadChats();
    loadGroups();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup socket event listeners for both 1-on-1 and group chats
  useEffect(() => {
    if (!socket) return;

    // Listen for new 1-on-1 messages (existing functionality)
    const handleReceiveMessage = (message) => {
      addMessage(message.chatId, message);
    };

    // Listen for new group messages
    const handleGroupMessage = (message) => {
      addGroupMessage(message.groupId, message);
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('group-message', handleGroupMessage);

    // Cleanup
    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('group-message', handleGroupMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, addMessage, addGroupMessage]);

  // Load all chats for the user
  const loadChats = async () => {
    try {
      const chats = await chatAPI.getChats();
      setChats(chats);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load all groups for the user
  const loadGroups = async () => {
    try {
      const groups = await groupAPI.getGroups();
      setGroups(groups);

      // Join all group rooms via socket
      if (socket) {
        groups.forEach((group) => {
          socket.emit('joinGroup', group.id);
        });
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  // Load messages for selected chat
  const loadMessages = async (chatId) => {
    try {
      const data = await messageAPI.getMessages(chatId);
      setMessages(chatId, data.messages);

      // Join chat room via socket
      if (socket) {
        socket.emit('joinChat', chatId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Handle chat selection
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setSelectedGroup(null); // Clear group selection
    loadMessages(chat.id);
  };

  // Handle group selection
  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedChat(null); // Clear chat selection
    loadGroupMessages(group.id);
  };

  // Load messages for selected group
  const loadGroupMessages = async (groupId) => {
    try {
      const data = await groupAPI.getGroupMessages(groupId);
      setGroupMessages(groupId, data.messages);

      // Join group room via socket
      if (socket) {
        socket.emit('joinGroup', groupId);
      }
    } catch (error) {
      console.error('Error loading group messages:', error);
    }
  };

  // Handle group creation
  const handleGroupCreated = (group) => {
    addGroup(group);
    handleSelectGroup(group);
    setActiveTab('groups');

    // Join group room via socket
    if (socket) {
      socket.emit('joinGroup', group.id);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar with tabs for chats and groups */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-80 bg-white border-r border-gray-200 flex flex-col"
      >
        {/* Tabs for switching between chats and groups */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('chats');
              setSelectedGroup(null);
            }}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === 'chats'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Chats
          </button>
          <button
            onClick={() => {
              setActiveTab('groups');
              setSelectedChat(null);
            }}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === 'groups'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Groups
          </button>
        </div>

        {/* Show appropriate sidebar based on active tab */}
        {activeTab === 'chats' ? (
          <Sidebar
            onSelectChat={handleSelectChat}
            onLogout={logout}
            currentUser={user}
            isConnected={isConnected}
          />
        ) : (
          <div className="flex-1 flex flex-col">
            {/* User header (same as Sidebar) */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user.username}</p>
                  <p className="text-xs text-gray-500">
                    {isConnected ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Logout
              </button>
            </div>

            {/* Group list */}
            <div className="flex-1 overflow-hidden">
              <GroupListSidebar
                onSelectGroup={handleSelectGroup}
                selectedGroup={selectedGroup}
                onCreateGroup={() => setShowCreateGroupModal(true)}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          // 1-on-1 chat view (existing functionality)
          <>
            <ChatHeader chat={selectedChat} />
            <div className="flex-1 overflow-hidden">
              <MessageList chatId={selectedChat.id} />
            </div>
            <MessageInput chatId={selectedChat.id} socket={socket} />
          </>
        ) : selectedGroup ? (
          // Group chat view
          <>
            {/* Group header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
                {selectedGroup.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">{selectedGroup.name}</h2>
                <p className="text-xs text-gray-500">
                  {selectedGroup.members.length} members
                </p>
              </div>
            </div>
            <GroupChatWindow groupId={selectedGroup.id} socket={socket} />
          </>
        ) : (
          // Empty state
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500"
            >
              <h2 className="text-2xl font-semibold mb-2">
                {activeTab === 'chats' ? 'Select a chat' : 'Select a group'}
              </h2>
              <p>
                {activeTab === 'chats'
                  ? 'Choose a conversation from the sidebar to start chatting'
                  : 'Choose a group or create a new one to start chatting'}
              </p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onGroupCreated={handleGroupCreated}
        currentUser={user}
      />
    </div>
  );
}

export default ChatPage;

