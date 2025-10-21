import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/lib/auth';
import {
  ArrowLeft,
  Send,
  Phone,
  Video,
  MoreHorizontal,
  Paperclip,
  Smile,
  CheckCheck,
  Check,
  Circle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  chatId: string;
  createdAt: string;
  readAt?: string;
  isRead: boolean;
  sender?: {
    id: string;
    name: string;
    profilePic?: string;
  };
}

interface ChatParticipant {
  id: string;
  name: string;
  profilePic?: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface Chat {
  id: string;
  initiatorId: string;
  recipientId: string;
  createdAt: string;
  updatedAt?: string;
  lastMessageAt?: string;
  isActive: boolean;
  messages: ChatMessage[];
  initiator: {
    id: string;
    name: string;
    profilePic?: string;
    isVerified: boolean;
  };
  recipient: {
    id: string;
    name: string;
    profilePic?: string;
    isVerified: boolean;
  };
}

const UserChatPage = () => {
  const router = useRouter();
  // Get chatId from window params set by the page wrapper
  const chatId = typeof window !== 'undefined' ? (window as any).__nextjsParams?.chatId : null;
  const { t, i18n } = useTranslation();
  const { user: currentUser } = useAuth();
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<ChatParticipant | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isRTL = i18n.language === 'ar';

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat data
  useEffect(() => {
    const fetchChat = async () => {
      if (!chatId || !currentUser) return;

      try {
        setLoading(true);
        const response = await fetch(`https://api.daleelbalady.com/api/chats/${chatId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Chat not found');
        }

        const data = await response.json();
        if (data.success) {
          setChat(data.chat);
          setMessages(data.chat.messages || []);
          
          // Determine the other participant
          const otherParticipant = data.chat.initiatorId === currentUser.id 
            ? {
                id: data.chat.recipient.id,
                name: data.chat.recipient.name,
                profilePic: data.chat.recipient.profilePic,
                isOnline: false, // We'll need to implement online status later
                lastSeen: undefined
              }
            : {
                id: data.chat.initiator.id,
                name: data.chat.initiator.name,
                profilePic: data.chat.initiator.profilePic,
                isOnline: false, // We'll need to implement online status later
                lastSeen: undefined
              };
          setOtherUser(otherParticipant);

          // Mark messages as read
          await markMessagesAsRead();
        } else {
          throw new Error(data.message || 'Failed to fetch chat');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [chatId, currentUser]);

  const markMessagesAsRead = async () => {
    if (!chatId || !currentUser) return;

    try {
      await fetch(`https://api.daleelbalady.com/api/chats/${chatId}/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: currentUser.id })
      });
    } catch (error) {
      console.warn('Failed to mark messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId || !currentUser || sending) return;

    setSending(true);
    try {
      const response = await fetch(`https://api.daleelbalady.com/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: newMessage.trim(),
          senderId: currentUser.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(prev => [...prev, data.message]);
          setNewMessage('');
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return isRTL ? 'اليوم' : 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return isRTL ? 'أمس' : 'Yesterday';
    } else {
      return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-blue-50/30 dark:from-stone-950 dark:via-stone-900 dark:to-stone-800/50">
        <Navbar />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 dark:border-stone-400 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-blue-50/30 dark:from-stone-950 dark:via-stone-900 dark:to-stone-800/50">
        <Navbar />
        <div className="min-h-screen pt-24 flex items-center justify-center px-6">
          <Card className="max-w-md mx-auto bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border border-white/20 dark:border-stone-700/20">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Circle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {isRTL ? 'المحادثة غير موجودة' : 'Chat Not Found'}
              </h2>
              <p className="text-stone-600 dark:text-stone-400 mb-6">
                {error || (isRTL ? 'لا يمكن العثور على هذه المحادثة' : 'This chat could not be found')}
              </p>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {isRTL ? 'عودة' : 'Go Back'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-blue-50/30 dark:from-stone-950 dark:via-stone-900 dark:to-stone-800/50">
      <Navbar />
      
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-4 h-[calc(100vh-5rem)]">
          <Card className="h-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border border-white/20 dark:border-stone-700/20 overflow-hidden">
            {/* Chat Header */}
            <CardHeader className="p-6 border-b border-stone-200 dark:border-stone-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                  >
                    <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={otherUser?.profilePic} alt={otherUser?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {otherUser?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {otherUser?.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-stone-900" />
                      )}
                    </div>
                    
                    <div>
                      <h2 className="font-semibold text-lg text-stone-900 dark:text-stone-100">
                        {otherUser?.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        {otherUser?.isOnline ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                            {isRTL ? 'متصل الآن' : 'Online'}
                          </Badge>
                        ) : (
                          <span className="text-sm text-stone-500 dark:text-stone-400">
                            {isRTL ? `آخر ظهور ${otherUser?.lastSeen || 'غير معروف'}` : `Last seen ${otherUser?.lastSeen || 'unknown'}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 p-0 flex flex-col h-[calc(100%-140px)]">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-stone-400 dark:text-stone-500 mb-2">
                        {isRTL ? 'ابدأ المحادثة' : 'Start the conversation'}
                      </div>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        {isRTL ? 'أرسل أول رسالة إلى' : 'Send your first message to'} {otherUser?.name}
                      </p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isCurrentUser = message.senderId === currentUser?.id;
                      const showDate = index === 0 || 
                        formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);
                      
                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="flex justify-center mb-4">
                              <Badge variant="secondary" className="text-xs">
                                {formatDate(message.createdAt)}
                              </Badge>
                            </div>
                          )}
                          
                          <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}>
                            <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                              <div
                                className={`px-4 py-3 rounded-2xl ${
                                  isCurrentUser
                                    ? 'bg-blue-600 text-white rounded-br-md'
                                    : 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-bl-md'
                                }`}
                              >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {message.text}
                                </p>
                              </div>
                              
                              <div className={`flex items-center gap-1 mt-1 text-xs text-stone-500 dark:text-stone-400 ${
                                isCurrentUser ? 'justify-end' : 'justify-start'
                              }`}>
                                <span>{formatTime(message.createdAt)}</span>
                                {isCurrentUser && (
                                  <div className="ml-1">
                                    {message.readAt ? (
                                      <CheckCheck className="h-3 w-3 text-blue-500" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Message Input */}
              <div className="p-6 border-t border-stone-200 dark:border-stone-700">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="text-stone-500 dark:text-stone-400">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isRTL ? 'اكتب رسالة...' : 'Type a message...'}
                      className="pr-12 rounded-full border-stone-300 dark:border-stone-600 focus:border-blue-500 focus:ring-blue-500"
                      disabled={sending}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-2 top-1/2 -transtone-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 p-0"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserChatPage;
