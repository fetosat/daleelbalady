const API_BASE_URL = '/api';

// Helper function to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('daleel-token');
  }
  return null;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  isEdited?: boolean;
  editedAt?: string;
  sender?: {
    id: string;
    name: string;
    profilePic?: string;
  };
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  uploaderId: string;
  createdAt: string;
}

export interface ChatParticipant {
  id: string;
  name: string;
  profilePic?: string;
  isVerified: boolean;
}

export interface Chat {
  id: string;
  initiatorId: string;
  recipientId: string;
  subject?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastMessageAt?: string;
  initiator: ChatParticipant;
  recipient: ChatParticipant;
  messages: ChatMessage[];
  _count?: {
    messages: number;
  };
}

export interface ChatListItem extends Omit<Chat, 'messages'> {
  messages: ChatMessage[];
  _count: {
    messages: number;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * Create a new chat or get existing chat between two users
 */
export async function createChat(
  initiatorId: string,
  recipientId: string,
  subject?: string
): Promise<Chat> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/chats`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ initiatorId, recipientId, subject }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create chat');
  }

  const data = await response.json();
  return data.chat;
}

/**
 * Get all chats for a user
 */
export async function getUserChats(
  userId: string,
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<{ chats: ChatListItem[]; pagination: PaginationInfo }> {
  const token = getAuthToken();
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (search) {
    params.append('search', search);
  }

  const response = await fetch(`${API_BASE_URL}/chats/user/${userId}?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch chats');
  }

  const data = await response.json();
  return { chats: data.chats, pagination: data.pagination };
}

/**
 * Get a specific chat with all messages
 */
export async function getChatById(
  chatId: string,
  page: number = 1,
  limit: number = 50
): Promise<{ chat: Chat; pagination: PaginationInfo }> {
  const token = getAuthToken();
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/chats/${chatId}?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch chat');
  }

  const data = await response.json();
  return { chat: data.chat, pagination: data.pagination };
}

/**
 * Send a message in a chat
 */
export async function sendMessage(
  chatId: string,
  senderId: string,
  text: string,
  attachmentIds?: string[]
): Promise<ChatMessage> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ senderId, text, attachmentIds }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send message');
  }

  const data = await response.json();
  return data.message;
}

/**
 * Mark a specific message as read
 */
export async function markMessageAsRead(
  chatId: string,
  messageId: string,
  userId: string
): Promise<ChatMessage> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages/${messageId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to mark message as read');
  }

  const data = await response.json();
  return data.message;
}

/**
 * Mark all messages in a chat as read
 */
export async function markAllMessagesAsRead(
  chatId: string,
  userId: string
): Promise<{ updatedCount: number }> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/chats/${chatId}/mark-all-read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to mark messages as read');
  }

  const data = await response.json();
  return { updatedCount: data.updatedCount };
}

/**
 * Archive or reactivate a chat
 */
export async function toggleChatArchive(
  chatId: string,
  userId: string,
  isActive: boolean
): Promise<Chat> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/chats/${chatId}/archive`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, isActive }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to toggle chat archive');
  }

  const data = await response.json();
  return data.chat;
}

/**
 * Delete a message (soft delete)
 */
export async function deleteMessage(
  chatId: string,
  messageId: string,
  userId: string
): Promise<void> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages/${messageId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete message');
  }
}

/**
 * Get total unread messages count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/chats/unread-count/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch unread count');
  }

  const data = await response.json();
  return data.unreadCount;
}

/**
 * Handle chat API errors
 */
export function handleChatApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

