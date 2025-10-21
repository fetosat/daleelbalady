'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Paperclip } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  sending?: boolean;
  placeholder?: string;
}

export function MessageInput({
  value,
  onChange,
  onSend,
  disabled = false,
  sending = false,
  placeholder = 'اكتب رسالة...',
}: MessageInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !sending) {
        onSend();
      }
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`
        p-4 border-t transition-colors
        ${
          isFocused
            ? 'border-emerald-500 dark:border-emerald-600 bg-white dark:bg-[#1a1c23]'
            : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#1a1c23]'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Attachment button (placeholder for future functionality) */}
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled || sending}
          className="h-10 w-10 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex-shrink-0"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Input field */}
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled || sending}
          className={`
            flex-1 h-10
            bg-white dark:bg-[#0f1117]
            border-stone-200 dark:border-stone-700
            text-stone-900 dark:text-stone-100
            placeholder:text-stone-400 dark:placeholder:text-stone-500
            focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600
            focus:border-transparent
            transition-all
          `}
        />

        {/* Send button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onSend}
            disabled={!value.trim() || disabled || sending}
            size="icon"
            className={`
              h-10 w-10 flex-shrink-0 transition-all
              ${
                value.trim() && !disabled && !sending
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg'
                  : 'bg-stone-200 dark:bg-stone-700 text-stone-400 dark:text-stone-500'
              }
            `}
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Character count or typing indicator could go here */}
      {value.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 text-xs text-stone-400 dark:text-stone-500 text-right"
        >
          {value.length} حرف
        </motion.div>
      )}
    </motion.div>
  );
}

