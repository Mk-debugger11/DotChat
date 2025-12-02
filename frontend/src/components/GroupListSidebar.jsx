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
    <div className="flex flex-col h-full bg-white">
      {/* Header with create button */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Groups</h3>
        <button
          onClick={onCreateGroup}
          className="px-3 py-1.5 bg-teal-500 text-white text-xs rounded-full hover:bg-teal-600 shadow-sm transition-colors"
        >
          + New
        </button>
      </div>

      {/* Groups list */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {groups.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            No groups yet. Create one to get started!
          </div>
        ) : (
          groups.map((group) => {
            const latestMessage = getLatestMessage(group);
            return (
              <motion.div
                key={group.id}
                whileHover={{ backgroundColor: '#ecfeff' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectGroup(group)}
                className={`px-4 py-3 border-b border-slate-100 cursor-pointer transition-colors ${
                  selectedGroup?.id === group.id
                    ? 'bg-teal-100 border-l-4 border-teal-500'
                    : 'hover:bg-teal-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Group avatar */}
                  <div className="w-11 h-11 rounded-2xl bg-teal-500 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-md">
                    {group.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Group info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-slate-800 truncate">
                        {group.name}
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
                        {latestMessage.content}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
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

