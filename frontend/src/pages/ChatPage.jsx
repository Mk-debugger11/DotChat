// Main chat page
// 2-column layout with sidebar and chat area
// Supports both 1-on-1 chats and group chats

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
import { useChatStore } from "../stores/chatStore";
import { useGroupStore } from "../stores/groupStore";
import { useSocketStore } from "../stores/socketStore";
import { chatAPI, messageAPI, groupAPI } from "../utils/api";
import Sidebar from "../components/Sidebar";
import GroupListSidebar from "../components/GroupListSidebar";
import CreateGroupModal from "../components/CreateGroupModal";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import GroupChatWindow from "../components/GroupChatWindow";

function ChatPage() {
  const { user, logout } = useAuthStore();
  const { selectedChat, setSelectedChat, setChats, setMessages, addMessage } =
    useChatStore();
  const {
    selectedGroup,
    setSelectedGroup,
    setGroups,
    addGroup,
    addGroupMessage,
    setGroupMessages,
  } = useGroupStore();
  const { socket, connect, disconnect, isConnected } = useSocketStore();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chats");
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Init connection + fetch data
  useEffect(() => {
    connect();
    loadChats();
    loadGroups();
    return () => disconnect();
    // eslint-disable-next-line
  }, []);

  // SOCKET LISTENERS (corrected)
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      const senderId =
        message.senderId || message.sender?.id || message.sender?._id;
      if (senderId === user.id) return; // ignore our own message

      addMessage(message.chatId, message);
    };

    const handleGroupMessage = (message) => {
      const senderId =
        message.senderId || message.sender?.id || message.sender?._id;
      if (senderId === user.id) return;
      addGroupMessage(message.groupId, message);
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("group-message", handleGroupMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("group-message", handleGroupMessage);
    };
  }, [socket, addMessage, addGroupMessage, user.id]);

  // LOAD CHATS
  const loadChats = async () => {
    try {
      const chats = await chatAPI.getChats();
      setChats(chats);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setLoading(false);
    }
  };

  // LOAD GROUPS
  const loadGroups = async () => {
    try {
      const groups = await groupAPI.getGroups();
      setGroups(groups);

      if (socket) {
        groups.forEach((group) => {
          socket.emit("joinGroup", group.id);
        });
      }
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  };

  // LOAD PRIVATE MESSAGES (FIXED)
  const loadMessages = async (chatId) => {
    try {
      const msgs = await messageAPI.getMessages(chatId); // backend returns array
      setMessages(chatId, msgs);

      if (socket) socket.emit("joinChat", chatId);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  // SELECT CHAT
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setSelectedGroup(null);
    loadMessages(chat.id);
  };

  // SELECT GROUP
  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedChat(null);
    loadGroupMessages(group.id);
  };

  // LOAD GROUP MESSAGES
  const loadGroupMessages = async (groupId) => {
    try {
      const res = await groupAPI.getGroupMessages(groupId);
      setGroupMessages(groupId, res.messages);

      if (socket) socket.emit("joinGroup", groupId);
    } catch (err) {
      console.error("Error loading group messages:", err);
    }
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -260, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="hidden md:flex w-80 bg-white border-r border-slate-200 flex-col"
      >
        <div className="flex border-b border-slate-200 bg-slate-50/60">
          <button
            onClick={() => {
              setActiveTab("chats");
              setSelectedGroup(null);
            }}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "chats"
                ? "text-teal-600 border-b-2 border-teal-500 bg-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Chats
          </button>

          <button
            onClick={() => {
              setActiveTab("groups");
              setSelectedChat(null);
            }}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "groups"
                ? "text-teal-600 border-b-2 border-teal-500 bg-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Groups
          </button>
        </div>

        {activeTab === "chats" ? (
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

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <ChatHeader chat={selectedChat} />
            <div className="flex-1 overflow-hidden">
              <MessageList chatId={selectedChat.id} />
            </div>
            <MessageInput chatId={selectedChat.id} socket={socket} />
          </>
        ) : selectedGroup ? (
          <>
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
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-slate-500 px-6"
            >
              <h2 className="text-2xl font-semibold mb-2">
                {activeTab === "chats" ? "Welcome to DotChat" : "DotChat Groups"}
              </h2>
            </motion.div>
          </div>
        )}
      </div>

      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onGroupCreated={addGroup}
        currentUser={user}
      />
    </div>
  );
}

export default ChatPage;
