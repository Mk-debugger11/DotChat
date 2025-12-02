import { useAuthStore } from '../stores/authStore';

const BASE_URL = 'https://dotchat-py90.onrender.com/api';

const apiRequest = async (method, endpoint, bodyData) => {
  const { token } = useAuthStore.getState();

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (bodyData) {
    options.body = JSON.stringify(bodyData);
  }

  const response = await fetch(BASE_URL + endpoint, options);

  let result;
  try {
    result = await response.json();
  } catch (_) {
    result = null;
  }

  if (!response.ok) {
    throw new Error(result?.error || 'Something went wrong');
  }

  return result;
};

export const authAPI = {
  register: (username, email, password) =>
    apiRequest('POST', '/auth/register', { username, email, password }),

  login: (username, password) =>
    apiRequest('POST', '/auth/login', { username, password })
};

export const userAPI = {
  searchUsers: (text) => apiRequest('GET', `/users/search?q=${text}`),

  getUserById: (id) => apiRequest('GET', `/users/${id}`)
};

export const chatAPI = {
  getChats: () => apiRequest('GET', '/chats'),

  getChatById: (chatId) => apiRequest('GET', `/chats/${chatId}`),

  createChat: (payload) => apiRequest('POST', '/chats', payload)
};

export const messageAPI = {
  sendMessage: (chatId, text) =>
    apiRequest('POST', '/messages', { chatId, text }),

  getMessages: (chatId, cursor = null, limit = 20) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.append('cursor', cursor);
    return apiRequest('GET', `/messages/${chatId}?${params.toString()}`);
  },

  searchMessages: (chatId, text) =>
    apiRequest('GET', `/messages/${chatId}/search?q=${text}`),

  // Edit existing message (private or group)
  editMessage: (messageId, text) =>
    apiRequest('PUT', `/messages/${messageId}`, { text }),

  // Delete existing message (private or group)
  deleteMessage: (messageId) =>
    apiRequest('DELETE', `/messages/${messageId}`)
};

export const groupAPI = {
  createGroup: (name, memberIds) =>
    apiRequest('POST', '/groups/create', { name, memberIds }),

  getGroups: () => apiRequest('GET', '/groups'),

  getGroupById: (groupId) =>
    apiRequest('GET', `/groups/${groupId}`),

  sendGroupMessage: (groupId, content) =>
    apiRequest('POST', `/groups/${groupId}/message`, { content }),

  getGroupMessages: (groupId, cursor = null, limit = 20) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.append('cursor', cursor);
    return apiRequest(
      'GET',
      `/groups/${groupId}/messages?${params.toString()}`
    );
  }
};

export default apiRequest;
