"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function TryAIButton() {
    return (
        <Link href="/dashboard/ai-chat">
            <motion.button
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold text-lg rounded-full shadow-lg hover:from-neon-purple hover:to-neon-blue transition-all duration-300 relative z-10 overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                <Sparkles className="w-6 h-6 mr-3 animate-pulse" />
                <span className="relative z-10">Try AI Finance Tool</span>
            </motion.button>
        </Link>
    )
} 