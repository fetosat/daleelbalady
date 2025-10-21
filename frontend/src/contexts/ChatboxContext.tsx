import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchSocket } from '@/services/searchSocket';

export type ChatboxPosition = 'hero' | 'search' | 'floating';

interface ChatboxContextType {
  // Chat state
  chatQuery: string;
  setChatQuery: (value: string) => void;
  aiMessage: string;
  setAiMessage: (value: string) => void;
  isTyping: boolean;
  setIsTyping: (value: boolean) => void;
  
  // UI state
  position: ChatboxPosition;
  setPosition: (position: ChatboxPosition) => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  
  // Actions
  handleChatSubmit: () => void;
  handleChatQueryChange: (value: string) => void;
  handleChatFocus: () => void;
  handleChatBlur: () => void;
  
  // Animation state
  isAnimating: boolean;
  setIsAnimating: (animating: boolean) => void;
}

const ChatboxContext = createContext<ChatboxContextType | undefined>(undefined);

export const useChatbox = () => {
  const context = useContext(ChatboxContext);
  if (!context) {
    throw new Error('useChatbox must be used within a ChatboxProvider');
  }
  return context;
};

interface ChatboxProviderProps {
  children: React.ReactNode;
}

export const ChatboxProvider: React.FC<ChatboxProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  
  // Chat state
  const [chatQuery, setChatQueryState] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // UI state
  const [position, setPosition] = useState<ChatboxPosition>('hero');
  const [isFocused, setIsFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Set up socket listeners
  useEffect(() => {
    const unsubscribeAI = searchSocket.onAiMessage((message) => {
      console.log('💬 ChatboxContext: Received AI message:', message);
      setIsTyping(false);
      const messageText = message.parameters?.message || message;
      console.log('📝 ChatboxContext: Setting AI message text:', messageText);
      setAiMessage(messageText);
      
      // Auto-blur chatbox after AI message (search completed)
      setTimeout(() => {
        console.log('🧽 ChatboxContext: Auto-blurring chatbox after AI response');
        setIsFocused(false);
      }, 1000);
      
      // Auto-clear AI message after 5 seconds
      setTimeout(() => {
        console.log('🧽 ChatboxContext: Clearing AI message');
        setAiMessage('');
      }, 5000);
    });

    const unsubscribeResults = searchSocket.onSearchResults((results) => {
      console.log('🔍 ChatboxContext: Received search results:', results);
      setIsTyping(false);
      
      // Auto-blur chatbox when search results arrive
      setTimeout(() => {
        console.log('🧽 ChatboxContext: Auto-blurring chatbox after search results');
        setIsFocused(false);
      }, 1000);
      
      // Handle navigation if cache info is available
      if (results && typeof results === 'object' && 'cache' in results && results.cache?.id) {
        console.log('📍 ChatboxContext: Navigating to search page with cache ID:', results.cache.id);
        setTimeout(() => {
          window.location.href = `/search?id=${results.cache.id}`;
        }, 1500);
      }
    });

    return () => {
      unsubscribeAI();
      unsubscribeResults();
    };
  }, []);

  // Check for pending search query from sessionStorage on mount
  useEffect(() => {
    const pendingQuery = sessionStorage.getItem('pendingSearchQuery');
    if (pendingQuery) {
      setChatQueryState(pendingQuery);
      sessionStorage.removeItem('pendingSearchQuery');
      // Auto-submit after a brief delay
      setTimeout(() => {
        handleChatSubmit();
      }, 100);
    }
  }, []);

  const handleChatQueryChange = useCallback((value: string) => {
    setChatQueryState(value);
  }, []);

  const setChatQuery = useCallback((value: string) => {
    setChatQueryState(value);
  }, []);

  const handleChatSubmit = useCallback(() => {
    if (chatQuery.trim()) {
      console.log('🎆 ChatboxContext: Chat query submitted:', chatQuery);
      setIsTyping(true);
      console.log('📤 ChatboxContext: Calling searchSocket.sendMessage...');
      searchSocket.sendMessage(chatQuery);
    }
  }, [chatQuery]);

  const handleChatFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleChatBlur = useCallback(() => {
    // Delay blur to allow for click events
    setTimeout(() => {
      setIsFocused(false);
    }, 150);
  }, []);

  const value: ChatboxContextType = {
    // Chat state
    chatQuery,
    setChatQuery,
    aiMessage,
    setAiMessage,
    isTyping,
    setIsTyping,
    
    // UI state
    position,
    setPosition,
    isFocused,
    setIsFocused,
    
    // Actions
    handleChatSubmit,
    handleChatQueryChange,
    handleChatFocus,
    handleChatBlur,
    
    // Animation state
    isAnimating,
    setIsAnimating,
  };

  return (
    <ChatboxContext.Provider value={value}>
      {children}
    </ChatboxContext.Provider>
  );
};
