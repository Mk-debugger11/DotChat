// Create Group Modal component
// Modal for creating a new group chat with member selection
// Uses Framer Motion for smooth animations

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { userAPI, groupAPI } from '../utils/api';
import UserAvatar from './UserAvatar';

function CreateGroupModal({ isOpen, onClose, onGroupCreated, currentUser }) {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search users when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Search users function
  const searchUsers = async (query) => {
    try {
      const users = await userAPI.searchUsers(query);
      // Filter out current user and already selected members
      const filtered = users.filter(
        (u) =>
          u.id !== currentUser.id &&
          !selectedMembers.some((m) => m.id === u.id)
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Add member to selection
  const handleAddMember = (user) => {
    if (!selectedMembers.some((m) => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
      setSearchQuery(''); // Clear search
    }
  };

  // Remove member from selection
  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== userId));
  };

  // Create group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError('');

    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    if (selectedMembers.length === 0) {
      setError('Please select at least one member');
      return;
    }

    setLoading(true);

    try {
      const memberIds = selectedMembers.map((m) => m.id);
      const group = await groupAPI.createGroup(groupName, memberIds);

      // Reset form
      setGroupName('');
      setSelectedMembers([]);
      setSearchQuery('');

      // Callback to parent
      onGroupCreated(group);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setGroupName('');
      setSelectedMembers([]);
      setSearchQuery('');
      setError('');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  Create Group Chat
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleCreateGroup} className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Group name input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter group name"
                    required
                  />
                </div>

                {/* Selected members */}
                {selectedMembers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selected Members ({selectedMembers.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedMembers.map((member) => (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full"
                        >
                          <UserAvatar user={member} size="sm" />
                          <span className="text-sm font-medium">{member.username}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ✕
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search for members */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Members
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Search users to add..."
                  />

                  {/* Search results */}
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto"
                    >
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleAddMember(user)}
                          className="w-full p-2 hover:bg-gray-100 flex items-center gap-2 text-left"
                        >
                          <UserAvatar user={user} size="sm" />
                          <span className="font-medium">{user.username}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Group'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CreateGroupModal;

