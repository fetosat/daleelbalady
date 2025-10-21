# Chat Components

Modern, Slack/Discord-style chat interface components with full dark mode support.

## Components

### ChatSidebar
Displays a list of conversations with search functionality, unread badges, and user avatars.

**Props:**
- `chats` - Array of chat list items
- `activeChat` - Currently selected chat
- `unreadCount` - Total unread messages count
- `loading` - Loading state
- `searchQuery` - Current search query
- `onSearchChange` - Search query change handler
- `onSelectChat` - Chat selection handler
- `onNewChat` - (Optional) New chat creation handler
- `currentUserId` - Current user's ID

**Features:**
- Search conversations
- Unread message badges
- Smart time formatting (today, yesterday, date)
- Verified user indicators
- Smooth animations with Framer Motion
- Full dark mode support

### ChatWindow
Main chat interface with message history, header, and input area.

**Props:**
- `chat` - Full chat object with participants
- `messages` - Array of messages
- `loading` - Chat loading state
- `sending` - Message sending state
- `newMessage` - Current message input value
- `onMessageChange` - Message input change handler
- `onSendMessage` - Message send handler
- `onBack` - (Optional) Back button handler for mobile
- `onArchive` - (Optional) Archive chat handler
- `onDelete` - (Optional) Delete chat handler
- `currentUserId` - Current user's ID

**Features:**
- Scrollable message history with auto-scroll
- Date dividers
- Video/phone call buttons (placeholder)
- Archive/delete actions
- Full dark mode support
- Responsive mobile layout

### MessageBubble
Individual message bubble with read receipts and animations.

**Props:**
- `message` - Message object
- `isCurrentUser` - Whether message is from current user
- `showAvatar` - (Optional) Show sender avatar

**Features:**
- Smooth fade-in animations
- Read receipts (single check, double check)
- Timestamp formatting
- Gradient avatars with initials fallback
- Adaptive colors (sent vs received)

### MessageInput
Message input field with send button and character count.

**Props:**
- `value` - Current input value
- `onChange` - Value change handler
- `onSend` - Send message handler
- `disabled` - Disabled state
- `sending` - Sending state
- `placeholder` - Input placeholder text

**Features:**
- Enter to send (Shift+Enter for new line)
- Character counter
- Attachment button (placeholder)
- Animated send button
- Focus state animations
- Full dark mode support

## Design System

### Color Palette

**Light Mode:**
- Background: `bg-stone-50`
- Card: `bg-white`
- Border: `border-stone-200`
- Text: `text-stone-900`
- Muted: `text-stone-500`
- Accent: `emerald-600`
- Sent Message: `bg-emerald-600`
- Received Message: `bg-stone-100`

**Dark Mode:**
- Background: `bg-[#0f1117]`
- Card: `bg-[#1a1c23]`
- Border: `border-stone-800`
- Text: `text-stone-100`
- Muted: `text-stone-400`
- Accent: `emerald-600`
- Sent Message: `bg-emerald-600`
- Received Message: `bg-[#2a2d35]`

### Animations
All components use Framer Motion for smooth, performant animations:
- Fade-in on mount
- Scale on hover
- Smooth transitions
- Loading indicators

## Usage Example

```tsx
import { ChatSidebar, ChatWindow } from '@/components/chat';
import { useState, useEffect } from 'react';
import { getUserChats, getChatById, sendMessage } from '@/api/chats';

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // ... fetch logic
  
  return (
    <div className="grid grid-cols-12 h-screen">
      <div className="col-span-3">
        <ChatSidebar
          chats={chats}
          activeChat={selectedChat}
          unreadCount={10}
          loading={loading}
          searchQuery=""
          onSearchChange={(q) => {}}
          onSelectChat={setSelectedChat}
          currentUserId={user.id}
        />
      </div>
      <div className="col-span-9">
        {selectedChat && (
          <ChatWindow
            chat={selectedChat}
            messages={messages}
            loading={false}
            sending={false}
            newMessage={newMessage}
            onMessageChange={setNewMessage}
            onSendMessage={handleSend}
            currentUserId={user.id}
          />
        )}
      </div>
    </div>
  );
}
```

## Dependencies
- `framer-motion` - Animations
- `lucide-react` - Icons
- `@/components/ui/*` - shadcn/ui components
- `@/api/chats` - Chat API functions

## Notes
- All components are fully responsive
- RTL support built-in (Arabic text)
- Optimized for performance with React best practices
- Accessible keyboard navigation

