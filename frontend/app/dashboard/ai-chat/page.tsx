"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, Bot, User, Sparkles, Clock, Lock } from "lucide-react"
import Link from "next/link"

type Message = {
    id: string
    content: string
    sender: "user" | "ai"
    timestamp: Date
}

const SAMPLE_QUESTIONS = [
    "How much did I spend on food last month?",
    "What was my largest transaction in the past week?",
    "Show me my savings trend over the past 3 months",
    "How much money did I send to my family last month?",
    "What are my top spending categories?",
]

const FREE_MESSAGE_LIMIT = 3

export default function AIChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            content: "Hello! I'm your AI-Pesa assistant. How can I help you with your finances today?",
            sender: "ai",
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [messageCount, setMessageCount] = useState(0)
    const [showSignupPrompt, setShowSignupPrompt] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()

        if (!input.trim()) return

        // Check if user has reached the free message limit
        if (messageCount >= FREE_MESSAGE_LIMIT) {
            setShowSignupPrompt(true)
            return
        }

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            content: input,
            sender: "user",
            timestamp: new Date(),
        }

        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsTyping(true)
        setMessageCount(prev => prev + 1)

        // Simulate AI response
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: getAIResponse(input),
                sender: "ai",
                timestamp: new Date(),
            }

            setMessages(prev => [...prev, aiMessage])
            setIsTyping(false)

            // Show signup prompt if this was the last free message
            if (messageCount + 1 >= FREE_MESSAGE_LIMIT) {
                setTimeout(() => {
                    setShowSignupPrompt(true)
                }, 1000)
            }
        }, 1500)
    }

    const getAIResponse = (userInput: string): string => {
        const input = userInput.toLowerCase()

        if (input.includes("spend") && input.includes("food")) {
            return "Based on your M-Pesa statements, you spent KSh 12,450 on food last month. This is about 15% of your total spending."
        } else if (input.includes("largest transaction")) {
            return "Your largest transaction in the past week was KSh 5,000 sent to John Doe on Monday, June 10th."
        } else if (input.includes("savings")) {
            return "Your savings have increased by 8% over the past 3 months. You saved KSh 8,000 in April, KSh 9,200 in May, and KSh 10,500 in June."
        } else if (input.includes("family")) {
            return "Last month, you sent a total of KSh 15,000 to contacts tagged as 'Family'. This includes KSh 8,000 to Mom, KSh 5,000 to Dad, and KSh 2,000 to Sister."
        } else if (input.includes("categories") || input.includes("spending")) {
            return "Your top spending categories last month were: 1. Utilities (KSh 18,500), 2. Food (KSh 12,450), 3. Transport (KSh 8,300), 4. Entertainment (KSh 5,200), and 5. Shopping (KSh 4,100)."
        } else {
            return "I don't have enough information to answer that question yet. Please upload your M-Pesa statements for more detailed insights."
        }
    }

    const handleQuickQuestion = (question: string) => {
        setInput(question)
    }

    return (
        <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1 flex flex-col max-w-4xl mx-auto w-full"
            >
                <h1 className="text-3xl font-bold mb-2 text-white">AI Financial Assistant</h1>
                <p className="text-gray-400 mb-2">
                    Ask questions about your finances and get personalized insights
                </p>
                <div className="flex items-center mb-6">
                    <div className="h-1 flex-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${(messageCount / FREE_MESSAGE_LIMIT) * 100}%` }}
                        ></div>
                    </div>
                    <span className="ml-3 text-sm text-gray-400">
                        {messageCount}/{FREE_MESSAGE_LIMIT} free messages
                    </span>
                </div>

                <div className="flex-1 bg-gray-800/50 rounded-lg p-4 mb-6 overflow-y-auto">
                    <div className="space-y-6">
                        {messages.map(message => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.sender === "user"
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-gray-700 text-gray-100 rounded-tl-none"
                                        }`}
                                >
                                    <div className="flex items-center mb-1">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2">
                                            {message.sender === "user" ? (
                                                <User className="h-4 w-4 text-white" />
                                            ) : (
                                                <Bot className="h-4 w-4 text-blue-400" />
                                            )}
                                        </div>
                                        <span className="text-xs opacity-75">
                                            {message.sender === "user" ? "You" : "AI-Pesa"}
                                        </span>
                                        <span className="text-xs opacity-50 ml-auto flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p>{message.content}</p>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-700 text-white rounded-2xl rounded-tl-none px-4 py-3">
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2">
                                            <Bot className="h-4 w-4 text-blue-400" />
                                        </div>
                                        <span className="text-xs opacity-75">AI-Pesa</span>
                                    </div>
                                    <div className="flex space-x-1 mt-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {showSignupPrompt && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/30 rounded-lg p-6 text-center"
                            >
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <Lock className="h-8 w-8 text-blue-400" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">You've reached the free message limit</h3>
                                <p className="text-gray-300 mb-6">
                                    Sign up for AI-Pesa to continue chatting with your AI financial assistant and unlock all features.
                                </p>
                                <div className="flex flex-wrap gap-4 justify-center">
                                    <Link href="/auth/signup">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium"
                                        >
                                            Sign Up Now
                                        </motion.button>
                                    </Link>
                                    <Link href="/auth/login">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-3 bg-gray-800 rounded-lg text-white font-medium"
                                        >
                                            Login
                                        </motion.button>
                                    </Link>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                        <Sparkles className="h-4 w-4 mr-1 text-blue-400" />
                        Suggested Questions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_QUESTIONS.map((question, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuickQuestion(question)}
                                disabled={showSignupPrompt}
                                className={`px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 rounded-full transition-colors ${showSignupPrompt ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
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
                        placeholder={showSignupPrompt ? "Sign up to continue chatting..." : "Ask about your finances..."}
                        disabled={showSignupPrompt}
                        className={`w-full bg-gray-800 text-white rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${showSignupPrompt ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    />
                    <button
                        type="submit"
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors ${showSignupPrompt || !input.trim() ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        disabled={showSignupPrompt || !input.trim()}
                    >
                        <Send className="h-4 w-4 text-white" />
                    </button>
                </form>
            </motion.div>
        </div>
    )
} 