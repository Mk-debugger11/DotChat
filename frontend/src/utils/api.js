import { useAuthStore } from '../stores/authStore';

const BASE_URL = 'https://dotchat-py90.onrender.com/api';

// -----------------------------
// Generic API Request Wrapper
// -----------------------------
const apiRequest = async (method, endpoint, bodyData) => {
  const { token } = useAuthStore.getState();

  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
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

// -----------------------------
// AUTH
// -----------------------------
export const authAPI = {
  register: (username, email, password) =>
    apiRequest('POST', '/auth/register', { username, email, password }),

  login: (username, password) =>
    apiRequest('POST', '/auth/login', { username, password })
};

// -----------------------------
// USERS
// -----------------------------
export const userAPI = {
  searchUsers: (text) => apiRequest('GET', `/users/search?q=${text}`),
  getUserById: (id) => apiRequest('GET', `/users/${id}`)
};

// -----------------------------
// PRIVATE CHATS
// -----------------------------
export const chatAPI = {
  getChats: () => apiRequest('GET', '/chats'),
  getChatById: (chatId) => apiRequest('GET', `/chats/${chatId}`),
  createChat: (payload) => apiRequest('POST', '/chats', payload)
};

// -----------------------------
// PRIVATE MESSAGES (FIXED)
// -----------------------------
export const messageAPI = {
  sendMessage: (chatId, text) =>
    apiRequest('POST', '/messages', { chatId, text }),

  // ALWAYS return { messages: [...] }
  getMessages: async (chatId, cursor = null, limit = 20) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.append('cursor', cursor);

    const data = await apiRequest('GET', `/messages/${chatId}?${params}`);

    // backend returns array → normalize
    if (Array.isArray(data)) {
      return { messages: data };
    }

    return data; // if backend sends object
  },

  searchMessages: (chatId, text) =>
    apiRequest('GET', `/messages/${chatId}/search?q=${text}`),

  editMessage: (messageId, text) =>
    apiRequest('PUT', `/messages/${messageId}`, { text }),

  deleteMessage: (messageId) =>
    apiRequest('DELETE', `/messages/${messageId}`)
};

// -----------------------------
// GROUPS
// -----------------------------
export const groupAPI = {
  createGroup: (name, memberIds) =>
    apiRequest('POST', '/groups/create', { name, memberIds }),

  getGroups: () => apiRequest('GET', '/groups'),

  getGroupById: (groupId) => apiRequest('GET', `/groups/${groupId}`),

  sendGroupMessage: (groupId, content) =>
    apiRequest('POST', `/groups/${groupId}/message`, { content }),

  // ALWAYS return { messages: [...] }
  getGroupMessages: async (groupId, cursor = null, limit = 20) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.append('cursor', cursor);

    const data = await apiRequest(
      'GET',
      `/groups/${groupId}/messages?${params}`
    );

    // backend returns array → normalize
    if (Array.isArray(data)) {
      return { messages: data };
    }

    return data;
  }
};

export default apiRequest;
