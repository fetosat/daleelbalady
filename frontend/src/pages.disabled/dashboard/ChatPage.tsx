import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Phone, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";

interface Message {
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: string;
}

interface Chat {
    id: string;
    name: string;
    lastMessage: string;
    lastMessageTime: string;
    unread: number;
    avatar?: string;
}

export default function ChatPage() {
    const { t } = useTranslation("dashboard");
    const [message, setMessage] = useState("");
    const { sendMessage: socketSendMessage, onAiMessage, onSearchResults, onRequestLocation } = useSocket();
    
    // We'll focus on AI chat, so we don't need multiple chats
    const [activeChat] = useState<string | null>("ai");

    const [chats] = useState<Chat[]>([
        {
            id: "ai",
            name: "دليل بلدي",
            lastMessage: "مرحباً! كيف يمكنني مساعدتك؟",
            lastMessageTime: "now",
            unread: 0,
        }
    ]);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            content: "مرحباً! أنا دليل بلدي 🤖 — اسألني عن الخدمات أو الأطباء.",
            sender: "ai",
            timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            })
        },
    ]);

    useEffect(() => {
        // Listen for AI messages
        onAiMessage((response) => {
            if (response && response.function === "reply_to_user" && response.parameters?.message) {
                const newMessage: Message = {
                    id: (messages.length + 1).toString(),
                    content: response.parameters.message,
                    sender: "ai",
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                };
                setMessages(prev => [...prev, newMessage]);
            }
        });

        // Listen for search results
        onSearchResults((results) => {
            // Format search results as a message
            const resultsMessage = results.map(result => 
                `${result.name}\n${result.description}${result.phone ? `\n📞 ${result.phone}` : ''}`
            ).join('\n\n');

            if (resultsMessage) {
                const newMessage: Message = {
                    id: (messages.length + 1).toString(),
                    content: resultsMessage,
                    sender: "ai",
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                };
                setMessages(prev => [...prev, newMessage]);
            }
        });

        // Handle location requests
        onRequestLocation(() => {
            const newMessage: Message = {
                id: (messages.length + 1).toString(),
                content: "تم تحديد موقعك بنجاح!",
                sender: "ai",
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
            setMessages(prev => [...prev, newMessage]);
        });
    }, []);

    const sendMessage = () => {
        if (!message.trim()) return;

        const newMessage: Message = {
            id: (messages.length + 1).toString(),
            content: message,
            sender: "user",
            timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        setMessages(prev => [...prev, newMessage]);
        socketSendMessage(message);
        setMessage("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <Card className="flex h-[calc(100vh-8rem)] bg-background p-6 rounded-lg shadow">
            {/* Chat List */}
            <div className="w-80 border-r">
                <div className="p-4 border-b">
                    <Input
                        placeholder={t("chatPage.search")}
                        className="w-full"
                    />
                </div>
                <ScrollArea className="h-full">
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            className={`p-4 cursor-pointer hover:bg-accent transition-colors ${activeChat === chat.id ? "bg-border" : ""
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="">
                                    {chat.avatar && <AvatarImage src={chat.avatar} />}
                                    <AvatarFallback>
                                        {chat.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium truncate">{chat.name}</p>
                                        <span className="text-xs text-muted-foreground">
                                            {chat.lastMessageTime}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {chat.lastMessage}
                                    </p>
                                </div>
                                {chat.unread > 0 && (
                                    <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {chat.unread}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </ScrollArea>
            </div>

            {/* Chat Content */}
            <div className="flex-1 flex flex-col">
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>
                                        {chats.find(c => c.id === activeChat)?.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">
                                        {chats.find(c => c.id === activeChat)?.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {t("chatPage.online")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg p-3 ${msg.sender === "user"
                                                    ? "bg-border text-foreground"
                                                    : "bg-muted"
                                                }`}
                                        >
                                            <p>{msg.content}</p>
                                            <p className="text-xs mt-1 opacity-70">
                                                {msg.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Message Input */}
                        <div className="p-4 border-t">
                            <div className="flex gap-2">
                                <Input
                                    placeholder={t("chatPage.typeMessage")}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                                <Button onClick={sendMessage}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        {t("chatPage.selectConversation")}
                    </div>
                )}
            </div>
        </Card>
    );
}
