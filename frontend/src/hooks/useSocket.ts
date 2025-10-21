import { useEffect, useCallback } from 'react';
import { socketService } from '../services/socket';

export interface ServiceResult {
  name: string;
  description: string;
  phone: string;
  // Add other service fields as needed
}

export interface AIMessage {
  function: string;
  parameters: {
    message: string;
  };
}

export const useSocket = () => {
  useEffect(() => {
    // Ensure socket connection is active (but don't create new ones)
    const socket = socketService.getSocket();
    
    // Log connection status
    console.log('useSocket hook initialized, client ID:', socketService.getClientId());
    
    // Don't disconnect on unmount as this is a shared singleton service
    // The socket should persist across component mounts/unmounts
    return () => {
      // Only log cleanup, don't disconnect the shared socket
      console.log('useSocket hook cleanup');
    };
  }, []);

  const sendMessage = useCallback((message: string) => {
    socketService.sendMessage(message);
  }, []);

  const onAiMessage = useCallback((callback: (message: AIMessage) => void) => {
    socketService.onAiMessage(callback);
  }, []);

  const onSearchResults = useCallback((callback: (results: ServiceResult[]) => void) => {
    socketService.onSearchResults(callback);
  }, []);

  const onRequestLocation = useCallback((callback: () => void) => {
    socketService.onRequestLocation(callback);
  }, []);

  return {
    sendMessage,
    onAiMessage,
    onSearchResults,
    onRequestLocation,
  };
};
