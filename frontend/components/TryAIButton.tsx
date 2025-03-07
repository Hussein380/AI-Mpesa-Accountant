"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { useChat } from "@/lib/context/ChatContext"

export default function TryAIButton() {
    const { remainingFreeMessages } = useChat()

    return (
        <div className="flex flex-col items-center gap-2">
            <Link href="/dashboard/ai-chat">
                <motion.button
                    className="inline-flex items-center px-4 sm:px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold text-base md:text-lg rounded-full shadow-lg hover:from-neon-purple hover:to-neon-blue transition-all duration-300 relative z-10 overflow-hidden group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 animate-pulse" />
                    <span className="relative z-10">Try AI Finance Tool</span>
                </motion.button>
            </Link>
            <p className="text-xs sm:text-sm text-gray-400">
                {remainingFreeMessages} free messages available
            </p>
        </div>
    )
} 