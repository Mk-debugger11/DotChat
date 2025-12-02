// Group store using Zustand
// Manages group chats, selected group, and group messages
// Separate from chatStore to keep 1-on-1 and group chats separate

import { create } from 'zustand';

export const useGroupStore = create((set, get) => ({
  // State
  groups: [], // List of all groups user is in
  selectedGroup: null, // Currently selected group
  groupMessages: {}, // Messages by groupId: { groupId: [messages] }
  loading: false, // Loading state

  // Actions
  // Set groups list
  setGroups: (groups) => {
    set({ groups });
  },

  // Add or update a group
  addGroup: (group) => {
    const { groups } = get();
    const existingIndex = groups.findIndex((g) => g.id === group.id);

    if (existingIndex >= 0) {
      // Update existing group
      const updatedGroups = [...groups];
      updatedGroups[existingIndex] = group;
      set({ groups: updatedGroups });
    } else {
      // Add new group
      set({ groups: [group, ...groups] });
    }
  },

  // Rename group locally
  renameGroup: (groupId, newName) => {
    const { groups, selectedGroup } = get();
    const updatedGroups = groups.map((g) =>
      g.id === groupId ? { ...g, name: newName } : g
    );
    set({
      groups: updatedGroups,
      selectedGroup:
        selectedGroup && selectedGroup.id === groupId
          ? { ...selectedGroup, name: newName }
          : selectedGroup
    });
  },

  // Add member locally
  addMember: (groupId, userId) => {
    const { groups, selectedGroup } = get();
    const updatedGroups = groups.map((g) =>
      g.id === groupId && !g.members.includes(userId)
        ? { ...g, members: [...g.members, userId] }
        : g
    );
    set({
      groups: updatedGroups,
      selectedGroup:
        selectedGroup && selectedGroup.id === groupId
          ? {
              ...selectedGroup,
              members: selectedGroup.members.includes(userId)
                ? selectedGroup.members
                : [...selectedGroup.members, userId]
            }
          : selectedGroup
    });
  },

  // Remove member locally
  removeMember: (groupId, userId) => {
    const { groups, selectedGroup } = get();
    const updatedGroups = groups.map((g) =>
      g.id === groupId
        ? { ...g, members: g.members.filter((id) => id !== userId) }
        : g
    );
    set({
      groups: updatedGroups,
      selectedGroup:
        selectedGroup && selectedGroup.id === groupId
          ? {
              ...selectedGroup,
              members: selectedGroup.members.filter((id) => id !== userId)
            }
          : selectedGroup
    });
  },

  // Delete group locally
  deleteGroup: (groupId) => {
    const { groups, selectedGroup } = get();
    set({
      groups: groups.filter((g) => g.id !== groupId),
      selectedGroup:
        selectedGroup && selectedGroup.id === groupId ? null : selectedGroup
    });
  },

  // Select a group
  setSelectedGroup: (group) => {
    set({ selectedGroup: group });
  },

  // Set messages for a group
  setGroupMessages: (groupId, messages) => {
    const { groupMessages: allMessages } = get();
    set({
      groupMessages: {
        ...allMessages,
        [groupId]: messages
      }
    });
  },

  // Add a message to a group
  addGroupMessage: (groupId, message) => {
    const { groupMessages: allMessages } = get();
    const groupMessages = allMessages[groupId] || [];
    set({
      groupMessages: {
        ...allMessages,
        [groupId]: [...groupMessages, message]
      }
    });
  },

  // Set loading state
  setLoading: (loading) => {
    set({ loading });
  }
}));

