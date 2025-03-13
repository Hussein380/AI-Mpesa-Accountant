"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, Bot, User, Sparkles, Clock, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useChat } from "@/lib/context/ChatContext"
import { useAuth } from "@/lib/context/AuthContext"
import { Button } from "@/components/ui/button"
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import { getEndpoint, createAuthenticatedRequest } from '../../../utils/api'
import Image from "next/image"
import { PaperAirplaneIcon, SparklesIcon, ChartBarIcon } from "@heroicons/react/24/outline"

const SAMPLE_QUESTIONS = [
    "How much did I spend on food last month?",
    "What was my largest transaction in the past week?",
    "What's my current balance?",
    "How much have I spent on entertainment this month?",
    "What are my top spending categories?",
    "How much money did I send to my family last month?",
    "Am I spending too much on shopping?",
    "How can I improve my savings based on my spending habits?",
]

// Custom components for markdown rendering
const markdownComponents: Components = {
    // Customize heading styles
    h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-2" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-lg font-bold my-2" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-md font-bold my-1" {...props} />,

    // Customize paragraph styles
    p: ({ node, ...props }) => <p className="mb-2" {...props} />,

    // Customize list styles
    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
    li: ({ node, ...props }) => <li className="mb-1" {...props} />,

    // Customize emphasis styles
    strong: ({ node, ...props }) => <strong className="font-bold text-blue-300" {...props} />,
    em: ({ node, ...props }) => <em className="italic text-gray-300" {...props} />,

    // Customize link styles
    a: ({ node, ...props }) => <a className="text-blue-400 underline hover:text-blue-300" {...props} />,
};

export default function AIChatPage() {
    const { messages, addMessage, remainingFreeMessages } = useChat()
    const { isAuthenticated, user } = useAuth()
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!input.trim()) return

        if (!isAuthenticated && remainingFreeMessages <= 0) {
            router.push("/auth/login")
            return
        }

        // Add user message
        await addMessage(input, "user")
        setInput("")
        setLoading(true)

        try {
            // Determine which endpoint to use based on authentication status
            const endpoint = isAuthenticated
                ? getEndpoint('ai/chat')
                : getEndpoint('ai/free-chat');

            // Create request with authentication in one atomic operation
            const requestConfig = createAuthenticatedRequest('POST', {
                message: input,
                previousMessages: messages.map(m => ({ role: m.role, content: m.content })),
                sessionId: localStorage.getItem('chatSessionId') || undefined
            });

            // Make API call to backend
            const response = await fetch(endpoint, requestConfig);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('API response:', data); // Debug log

            // Save session ID if provided
            if (data.data && data.data.sessionId && data.data.sessionId !== 'free-session') {
                localStorage.setItem('chatSessionId', data.data.sessionId);
            }

            // Add AI response - Fix: Use data.data.response instead of data.message
            if (data.data && data.data.response) {
                await addMessage(
                    data.data.response,
                    "assistant",
                    data.data.hasFinancialContext,
                    data.data.hasVisualizationReferences
                );
            } else {
                console.error('Invalid response format:', data);
                await addMessage("Sorry, I received an invalid response format. Please try again.", "assistant");
            }

        } catch (error) {
            console.error('Error sending message:', error);
            await addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", "assistant");
        } finally {
            setLoading(false);
        }
    }

    const handleQuickQuestion = (question: string) => {
        setInput(question)
    }

    return (
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 h-[calc(100vh-64px)] flex flex-col">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1 flex flex-col max-w-4xl mx-auto w-full"
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-white">AI Financial Assistant</h1>
                        <p className="text-sm text-gray-400">
                            Ask questions about your finances and get personalized insights
                        </p>
                    </div>
                    {!isAuthenticated && (
                        <div className="text-left sm:text-right w-full sm:w-auto">
                            <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
                                {remainingFreeMessages} free messages remaining
                            </p>
                            <Button
                                onClick={() => router.push("/auth/login")}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1 h-auto sm:h-8 w-full sm:w-auto"
                            >
                                <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                                Login for unlimited access
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex-1 bg-gray-800/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 overflow-y-auto">
                    <div className="space-y-4 sm:space-y-6">
                        {messages.map(message => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${message.role === "user"
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-gray-700 text-gray-100 rounded-tl-none"
                                        }`}
                                >
                                    <div className="flex items-center mb-1">
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center mr-1 sm:mr-2">
                                            {message.role === "user" ? (
                                                <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                                            ) : (
                                                <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                                            )}
                                        </div>
                                        <span className="text-xs opacity-75">
                                            {message.role === "user" ? "You" : "AI-Pesa"}
                                        </span>
                                        {message.role === "assistant" && message.hasFinancialContext && (
                                            <span className="text-xs bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded-full ml-1.5 flex items-center">
                                                <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                                                Personalized
                                            </span>
                                        )}
                                        {message.role === "assistant" && message.hasVisualizationReferences && (
                                            <span className="text-xs bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded-full ml-1.5 flex items-center">
                                                <ChartBarIcon className="h-2.5 w-2.5 mr-0.5" />
                                                Dashboard Reference
                                            </span>
                                        )}
                                        <span className="text-xs opacity-50 ml-auto flex items-center">
                                            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    {message.role === "assistant" ? (
                                        <div className="text-sm sm:text-base prose prose-invert max-w-none">
                                            <ReactMarkdown
                                                components={markdownComponents}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="text-sm sm:text-base break-words">{message.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-700 text-white rounded-2xl rounded-tl-none px-3 sm:px-4 py-2 sm:py-3">
                                    <div className="flex items-center">
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center mr-1 sm:mr-2">
                                            <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                                        </div>
                                        <span className="text-xs opacity-75">AI-Pesa</span>
                                    </div>
                                    <div className="flex space-x-1 mt-2">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="mb-3 sm:mb-4">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2 flex items-center">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-blue-400" />
                        Suggested Questions
                    </h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {SAMPLE_QUESTIONS.map((question, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuickQuestion(question)}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-800 hover:bg-gray-700 text-xs sm:text-sm text-gray-300 rounded-full transition-colors"
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSendMessage} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                            !isAuthenticated && remainingFreeMessages <= 0
                                ? "Login to continue chatting..."
                                : "Ask about your finances..."
                        }
                        className={`w-full bg-gray-800 text-white rounded-full pl-3 sm:pl-4 pr-10 sm:pr-12 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isAuthenticated && remainingFreeMessages <= 0 ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        disabled={!isAuthenticated && remainingFreeMessages <= 0}
                    />
                    <button
                        type="submit"
                        className={`absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors ${!input.trim() || (!isAuthenticated && remainingFreeMessages <= 0)
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                            }`}
                        disabled={!input.trim() || (!isAuthenticated && remainingFreeMessages <= 0)}
                    >
                        <PaperAirplaneIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </button>
                </form>
            </motion.div>
        </div>
    )
} 