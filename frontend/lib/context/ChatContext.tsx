"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';  // Assuming you have AuthContext

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}

interface ChatContextType {
    messages: Message[];
    addMessage: (content: string, role: 'user' | 'assistant') => void;
    remainingFreeMessages: number;
    isLoading: boolean;
    clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [remainingFreeMessages, setRemainingFreeMessages] = useState(4);
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        // Reset remaining messages when auth state changes
        if (isAuthenticated) {
            setRemainingFreeMessages(Infinity);
        } else {
            setRemainingFreeMessages(4 - messages.filter(m => m.role === 'user').length);
        }
    }, [isAuthenticated, messages]);

    const addMessage = async (content: string, role: 'user' | 'assistant') => {
        const newMessage: Message = {
            id: Date.now().toString(),
            content,
            role,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, newMessage]);

        if (role === 'user' && !isAuthenticated) {
            setRemainingFreeMessages(prev => prev - 1);
        }
    };

    const clearChat = () => {
        setMessages([]);
        if (!isAuthenticated) {
            setRemainingFreeMessages(4);
        }
    };

    return (
        <ChatContext.Provider
            value={{
                messages,
                addMessage,
                remainingFreeMessages,
                isLoading,
                clearChat,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
} 