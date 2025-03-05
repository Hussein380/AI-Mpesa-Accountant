"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, Bot, User, Sparkles, Clock, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useChat } from "@/lib/context/ChatContext"
import { useAuth } from "@/lib/context/AuthContext"
import { Button } from "@/components/ui/button"

const SAMPLE_QUESTIONS = [
    "How much did I spend on food last month?",
    "What was my largest transaction in the past week?",
    "Show me my savings trend over the past 3 months",
    "How much money did I send to my family last month?",
    "What are my top spending categories?",
]

export default function AIChatPage() {
    const { messages, addMessage, remainingFreeMessages, isLoading } = useChat()
    const { isAuthenticated } = useAuth()
    const [input, setInput] = useState("")
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

        // Simulate AI response
        setTimeout(async () => {
            await addMessage(getAIResponse(input), "assistant")
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
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 text-white">AI Financial Assistant</h1>
                        <p className="text-gray-400">
                            Ask questions about your finances and get personalized insights
                        </p>
                    </div>
                    {!isAuthenticated && (
                        <div className="text-right">
                            <p className="text-sm text-gray-400 mb-2">
                                {remainingFreeMessages} free messages remaining
                            </p>
                            <Button
                                onClick={() => router.push("/auth/login")}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Lock className="w-4 h-4" />
                                Login for unlimited access
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex-1 bg-gray-800/50 rounded-lg p-4 mb-6 overflow-y-auto">
                    <div className="space-y-6">
                        {messages.map(message => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                                            ? "bg-blue-600 text-white rounded-tr-none"
                                            : "bg-gray-700 text-gray-100 rounded-tl-none"
                                        }`}
                                >
                                    <div className="flex items-center mb-1">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2">
                                            {message.role === "user" ? (
                                                <User className="h-4 w-4 text-white" />
                                            ) : (
                                                <Bot className="h-4 w-4 text-blue-400" />
                                            )}
                                        </div>
                                        <span className="text-xs opacity-75">
                                            {message.role === "user" ? "You" : "AI-Pesa"}
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

                        {isLoading && (
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
                                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 rounded-full transition-colors"
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
                        className={`w-full bg-gray-800 text-white rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isAuthenticated && remainingFreeMessages <= 0 ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        disabled={!isAuthenticated && remainingFreeMessages <= 0}
                    />
                    <button
                        type="submit"
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors ${!input.trim() || (!isAuthenticated && remainingFreeMessages <= 0)
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                        disabled={!input.trim() || (!isAuthenticated && remainingFreeMessages <= 0)}
                    >
                        <Send className="h-4 w-4 text-white" />
                    </button>
                </form>
            </motion.div>
        </div>
    )
} 