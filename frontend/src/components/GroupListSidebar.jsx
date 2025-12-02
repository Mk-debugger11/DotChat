// Group List Sidebar component
// Shows list of groups user is part of
// Similar to chat list but for groups

import { motion } from 'framer-motion';
import { useGroupStore } from '../stores/groupStore';
import UserAvatar from './UserAvatar';

function GroupListSidebar({ onSelectGroup, selectedGroup, onCreateGroup }) {
  const { groups } = useGroupStore();

  // Get latest message preview
  const getLatestMessage = (group) => {
    if (group.groupMessages && group.groupMessages.length > 0) {
      return group.groupMessages[0];
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full border-r border-gray-200 bg-gray-50">
      {/* Header with create button */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">Groups</h3>
          <button
            onClick={onCreateGroup}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
          >
            + New
          </button>
        </div>
      </div>

      {/* Groups list */}
      <div className="flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No groups yet. Create one to get started!
          </div>
        ) : (
          groups.map((group) => {
            const latestMessage = getLatestMessage(group);
            return (
              <motion.div
                key={group.id}
                whileHover={{ backgroundColor: '#f3f4f6' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectGroup(group)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedGroup?.id === group.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Group avatar */}
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {group.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Group info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {group.name}
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
                        {latestMessage.content}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {group.members.length} members
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default GroupListSidebar;

