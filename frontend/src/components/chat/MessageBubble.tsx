'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCheck, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatMessage } from '@/api/chats';

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  showAvatar?: boolean;
}

export function MessageBubble({ message, isCurrentUser, showAvatar = false }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex gap-2 ${isCurrentUser ? 'justify-start' : 'justify-end'}`}
    >
      {/* Avatar for received messages */}
      {!isCurrentUser && showAvatar && message.sender && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender.profilePic} />
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
            {message.sender.name?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col ${isCurrentUser ? 'items-start' : 'items-end'} max-w-[70%]`}>
        {/* Sender name for group chats */}
        {!isCurrentUser && showAvatar && message.sender && (
          <span className="text-xs text-stone-500 dark:text-stone-400 mb-1 px-2">
            {message.sender.name}
          </span>
        )}

        {/* Message bubble */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`
            px-4 py-3 rounded-2xl shadow-sm
            ${
              isCurrentUser
                ? 'bg-emerald-600 text-white rounded-br-md'
                : 'bg-stone-100 dark:bg-[#2a2d35] text-stone-900 dark:text-stone-100 rounded-bl-md'
            }
          `}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
          </p>
        </motion.div>

        {/* Time and read status */}
        <div
          className={`flex items-center gap-1 mt-1 px-2 text-xs text-stone-500 dark:text-stone-400 ${
            isCurrentUser ? 'justify-start' : 'justify-end'
          }`}
        >
          <span>{formatTime(message.createdAt)}</span>
          {isCurrentUser && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mr-1"
            >
              {message.readAt || message.isRead ? (
                <CheckCheck className="h-3 w-3 text-emerald-500" />
              ) : (
                <Check className="h-3 w-3 text-stone-400" />
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Avatar for sent messages */}
      {isCurrentUser && showAvatar && message.sender && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender.profilePic} />
          <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-blue-500 text-white text-xs">
            {message.sender.name?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}

