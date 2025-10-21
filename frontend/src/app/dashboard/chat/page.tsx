'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardTransition } from '@/components/DashboardTransition';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { MessageSquare } from 'lucide-react';
import {
  getUserChats,
  getChatById,
  sendMessage,
  markAllMessagesAsRead,
  getUnreadCount,
  type ChatListItem,
  type Chat,
  type ChatMessage,
} from '@/api/chats';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';

export default function ChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedChatListItem, setSelectedChatListItem] = useState<ChatListItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  // Fetch chats on mount
  useEffect(() => {
    if (user?.id) {
      fetchChats();
      fetchUnreadCount();
    }
  }, [user]);

  const fetchChats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { chats: fetchedChats } = await getUserChats(user.id, 1, 50, searchQuery);
      setChats(fetchedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user?.id) return;

    try {
      const count = await getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleSelectChat = async (chat: ChatListItem) => {
    if (!user?.id) return;

    try {
      setLoadingChat(true);
      setSelectedChatListItem(chat);
      const { chat: fullChat } = await getChatById(chat.id);
      setSelectedChat(fullChat);
      setMessages(fullChat.messages || []);

      // Mark messages as read
      await markAllMessagesAsRead(chat.id, user.id);
      fetchUnreadCount();
      fetchChats(); // Refresh to update unread counts
    } catch (error) {
      console.error('Error loading chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation',
        variant: 'destructive',
      });
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user?.id || sending) return;

    try {
      setSending(true);
      const message = await sendMessage(selectedChat.id, user.id, newMessage.trim());
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
      fetchChats(); // Refresh to update last message
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };


  return (
    <DashboardTransition>
      <div className="h-[calc(100vh-4rem)] bg-stone-50 dark:bg-[#0f1117]">
        <div className="grid grid-cols-12 h-full">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <ChatSidebar
              chats={chats}
              activeChat={selectedChatListItem}
              unreadCount={unreadCount}
              loading={loading}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectChat={handleSelectChat}
              currentUserId={user?.id}
            />
          </div>

          {/* Chat Window */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9">
            {selectedChat ? (
              <ChatWindow
                chat={selectedChat}
                messages={messages}
                loading={loadingChat}
                sending={sending}
                newMessage={newMessage}
                onMessageChange={setNewMessage}
                onSendMessage={handleSendMessage}
                onBack={() => {
                  setSelectedChat(null);
                  setSelectedChatListItem(null);
                }}
                currentUserId={user?.id}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-[#1a1c23]">
                <MessageSquare className="h-20 w-20 text-stone-400 dark:text-stone-600 mb-6" />
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">اختر محادثة</h2>
                <p className="text-stone-500 dark:text-stone-400">
                  اختر محادثة من القائمة لبدء المراسلة
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardTransition>
  );
}
