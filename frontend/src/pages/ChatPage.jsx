// Main chat page
// 2-column layout with sidebar and chat area
// Supports both 1-on-1 chats and group chats

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile drawer

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
      // Ignore socket events for your own messages
      if (message.senderId === user.id) return;
    
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

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Desktop sidebar with tabs for chats and groups */}
      <motion.div
        initial={{ x: -260, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="hidden md:flex w-80 bg-white border-r border-slate-200 flex-col"
      >
        {/* Tabs for switching between chats and groups */}
        <div className="flex border-b border-slate-200 bg-slate-50/60">
          <button
            onClick={() => {
              setActiveTab('chats');
              setSelectedGroup(null);
            }}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'chats'
                ? 'text-teal-600 border-b-2 border-teal-500 bg-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Chats
          </button>
          <button
            onClick={() => {
              setActiveTab('groups');
              setSelectedChat(null);
            }}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'groups'
                ? 'text-teal-600 border-b-2 border-teal-500 bg-white'
                : 'text-slate-600 hover:bg-slate-100'
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
          <GroupListSidebar
            onSelectGroup={handleSelectGroup}
            selectedGroup={selectedGroup}
            onCreateGroup={() => setShowCreateGroupModal(true)}
          />
        )}
      </motion.div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex md:hidden"
          >
            <div
              className="flex-1 bg-black/40"
              onClick={closeSidebar}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              className="w-72 max-w-full h-full bg-white shadow-xl flex flex-col"
            >
              {/* Small DotChat badge for mobile */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="bg-teal-500 text-white rounded-lg px-2 py-1 text-xs font-semibold shadow">
                    Dc
                  </div>
                  <span className="text-sm font-semibold text-teal-600">
                    DotChat
                  </span>
                </div>
                <button
                  onClick={closeSidebar}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Close
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50/60">
                <button
                  onClick={() => {
                    setActiveTab('chats');
                    setSelectedGroup(null);
                  }}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                    activeTab === 'chats'
                      ? 'text-teal-600 border-b-2 border-teal-500 bg-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Chats
                </button>
                <button
                  onClick={() => {
                    setActiveTab('groups');
                    setSelectedChat(null);
                  }}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                    activeTab === 'groups'
                      ? 'text-teal-600 border-b-2 border-teal-500 bg-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Groups
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                {activeTab === 'chats' ? (
                  <Sidebar
                    onSelectChat={(chat) => {
                      handleSelectChat(chat);
                      closeSidebar();
                    }}
                    onLogout={logout}
                    currentUser={user}
                    isConnected={isConnected}
                  />
                ) : (
                  <GroupListSidebar
                    onSelectGroup={(group) => {
                      handleSelectGroup(group);
                      closeSidebar();
                    }}
                    selectedGroup={selectedGroup}
                    onCreateGroup={() => {
                      setShowCreateGroupModal(true);
                      closeSidebar();
                    }}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile top bar with DotChat badge and menu button */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <div className="bg-teal-500 text-white rounded-lg px-2 py-1 text-xs font-semibold shadow">
              Dc
            </div>
            <span className="text-sm font-semibold text-teal-600">
              DotChat
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-xs font-medium text-slate-600 border border-slate-200 rounded-full px-3 py-1 hover:bg-slate-50"
          >
            Menu
          </button>
        </div>
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
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-teal-500 flex items-center justify-center text-white font-semibold shadow-md">
                {selectedGroup.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-semibold text-teal-600">
                  {selectedGroup.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedGroup.members.length} members
                </p>
              </div>
            </div>
            <GroupChatWindow groupId={selectedGroup.id} socket={socket} />
          </>
        ) : (
          // Empty state
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-slate-500 px-6"
            >
              <h2 className="text-2xl font-semibold mb-2">
                {activeTab === 'chats' ? 'Welcome to DotChat' : 'DotChat Groups'}
              </h2>
              <p className="text-sm">
                {activeTab === 'chats'
                  ? 'Select a conversation from the sidebar or start a new one to begin chatting.'
                  : 'Select a group or create a new one to start a group conversation.'}
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

