'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  MoreVertical,
  Archive,
  Trash2,
  Loader2,
  MessageSquare,
  Phone,
  Video,
} from 'lucide-react';
import { Chat, ChatMessage } from '@/api/chats';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  chat: Chat;
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  newMessage: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onBack?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  currentUserId?: string;
}

export function ChatWindow({
  chat,
  messages,
  loading,
  sending,
  newMessage,
  onMessageChange,
  onSendMessage,
  onBack,
  onArchive,
  onDelete,
  currentUserId,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getOtherParticipant = () => {
    if (!currentUserId) return null;
    return chat.initiatorId === currentUserId ? chat.recipient : chat.initiator;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'اليوم';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'أمس';
    } else {
      return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  const otherUser = getOtherParticipant();

  return (
    <div className="flex flex-col h-full bg-stone-50 dark:bg-[#0f1117]">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1a1c23] shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Back button for mobile */}
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-stone-600 dark:text-stone-400"
                onClick={onBack}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}

            {/* User avatar and info */}
            <Avatar className="h-10 w-10 ring-2 ring-emerald-400 dark:ring-emerald-600">
              <AvatarImage src={otherUser?.profilePic} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-blue-500 text-white font-semibold">
                {otherUser?.name?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                {otherUser?.name}
                {otherUser?.isVerified && (
                  <div className="h-4 w-4 bg-emerald-500 rounded-full" />
                )}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">متصل</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <Video className="h-5 w-5" />
            </Button>

            {/* More options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-stone-600 dark:text-stone-400">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onArchive && (
                  <DropdownMenuItem onClick={onArchive}>
                    <Archive className="h-4 w-4 ml-2" />
                    أرشفة المحادثة
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-red-600 dark:text-red-400">
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف المحادثة
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-16 w-16 text-stone-400 dark:text-stone-600 mb-4" />
            <p className="text-stone-500 dark:text-stone-400">ابدأ المحادثة بإرسال رسالة</p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            <AnimatePresence>
              {messages.map((message, index) => {
                const isCurrentUser = message.senderId === currentUserId;
                const showDate =
                  index === 0 ||
                  formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                return (
                  <div key={message.id}>
                    {/* Date divider */}
                    {showDate && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-center mb-4"
                      >
                        <Badge
                          variant="secondary"
                          className="text-xs bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300"
                        >
                          {formatDate(message.createdAt)}
                        </Badge>
                      </motion.div>
                    )}

                    {/* Message bubble */}
                    <MessageBubble message={message} isCurrentUser={isCurrentUser} showAvatar={false} />
                  </div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Typing indicator (placeholder for future real-time functionality) */}
      {/* 
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pb-2"
      >
        <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            •
          </motion.span>
          <span>يكتب...</span>
        </div>
      </motion.div>
      */}

      {/* Message Input */}
      <MessageInput
        value={newMessage}
        onChange={onMessageChange}
        onSend={onSendMessage}
        sending={sending}
        disabled={loading}
      />
    </div>
  );
}

