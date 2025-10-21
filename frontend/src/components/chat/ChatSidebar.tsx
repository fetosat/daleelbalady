'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Search, MessageSquarePlus, CheckCheck, Check, Users } from 'lucide-react';
import { ChatListItem } from '@/api/chats';

interface ChatSidebarProps {
  chats: ChatListItem[];
  activeChat: ChatListItem | null;
  unreadCount: number;
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectChat: (chat: ChatListItem) => void;
  onNewChat?: () => void;
  currentUserId?: string;
}

export function ChatSidebar({
  chats,
  activeChat,
  unreadCount,
  loading,
  searchQuery,
  onSearchChange,
  onSelectChat,
  onNewChat,
  currentUserId,
}: ChatSidebarProps) {
  const getOtherParticipant = (chat: ChatListItem) => {
    if (!currentUserId) return null;
    return chat.initiatorId === currentUserId ? chat.recipient : chat.initiator;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('ar-EG', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a1c23] border-r border-stone-200 dark:border-stone-800">
      {/* Header */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">المحادثات</h1>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
                {unreadCount}
              </Badge>
            )}
            {onNewChat && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onNewChat}
                className="h-8 w-8 text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <MessageSquarePlus className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -transtone-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
          <Input
            placeholder="بحث في المحادثات..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-10 bg-stone-50 dark:bg-[#0f1117] border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-500 dark:placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full bg-stone-200 dark:bg-stone-700" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-stone-200 dark:bg-stone-700" />
                  <Skeleton className="h-3 w-1/2 bg-stone-200 dark:bg-stone-700" />
                </div>
              </div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Users className="h-16 w-16 text-stone-400 dark:text-stone-600 mb-4" />
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
              لا توجد محادثات
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              ستظهر محادثاتك هنا عندما يتواصل معك العملاء
            </p>
          </div>
        ) : (
          <div>
            {chats.map((chat) => {
              const otherUser = getOtherParticipant(chat);
              const lastMessage = chat.messages[0];
              const isActive = activeChat?.id === chat.id;
              const hasUnread = chat._count.messages > 0;

              return (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className={`
                    p-4 cursor-pointer border-b border-stone-100 dark:border-stone-800
                    transition-colors duration-200
                    ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-[#1d1f27] border-l-4 border-l-emerald-600'
                        : 'hover:bg-stone-50 dark:hover:bg-[#1d1f27]'
                    }
                  `}
                  onClick={() => onSelectChat(chat)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12 ring-2 ring-transparent hover:ring-emerald-400 transition-all">
                        <AvatarImage src={otherUser?.profilePic} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-blue-500 text-white font-semibold">
                          {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      {otherUser?.isVerified && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1a1c23]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`font-semibold text-sm truncate ${
                            hasUnread
                              ? 'text-stone-900 dark:text-stone-50'
                              : 'text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          {otherUser?.name}
                        </h3>
                        {lastMessage && (
                          <span className="text-xs text-stone-500 dark:text-stone-400 flex-shrink-0 mr-2">
                            {formatTime(lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      {lastMessage && (
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm truncate ${
                              hasUnread
                                ? 'font-semibold text-stone-900 dark:text-stone-100'
                                : 'text-stone-500 dark:text-stone-400'
                            }`}
                          >
                            {lastMessage.senderId === currentUserId && (
                              <span className="ml-1 inline-flex">
                                {lastMessage.isRead ? (
                                  <CheckCheck className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Check className="h-3 w-3 text-stone-400" />
                                )}
                              </span>
                            )}
                            {lastMessage.text}
                          </p>
                          {hasUnread && (
                            <Badge className="bg-emerald-600 text-white text-xs h-5 min-w-[20px] rounded-full flex items-center justify-center px-1.5">
                              {chat._count.messages}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

