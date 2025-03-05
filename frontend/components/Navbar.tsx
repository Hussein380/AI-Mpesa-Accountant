"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import Link from "next/link"

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
        setIsMenuOpen(false)
    }

    return (
        <nav className="absolute top-0 left-0 right-0 z-50 py-4 px-6">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-white">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple">
                        AI-Pesa
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    <button
                        onClick={() => scrollToSection('features')}
                        className="text-white hover:text-neon-blue transition-colors cursor-pointer"
                    >
                        Features
                    </button>
                    <button
                        onClick={() => scrollToSection('how-it-works')}
                        className="text-white hover:text-neon-blue transition-colors cursor-pointer"
                    >
                        How It Works
                    </button>
                    <Link href="/auth/login" className="px-5 py-2 bg-black/30 backdrop-blur-sm border border-neon-blue/30 rounded-full text-white hover:bg-black/50 transition-colors">
                        Login
                    </Link>
                    <Link href="/auth/signup" className="px-5 py-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full text-white hover:opacity-90 transition-opacity">
                        Sign Up
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="md:hidden absolute top-16 left-0 right-0 bg-black/80 backdrop-blur-lg border-b border-neon-blue/20"
                >
                    <div className="container mx-auto py-4 px-6 flex flex-col space-y-4">
                        <button
                            onClick={() => scrollToSection('features')}
                            className="text-white py-2 hover:text-neon-blue transition-colors text-left"
                        >
                            Features
                        </button>
                        <button
                            onClick={() => scrollToSection('how-it-works')}
                            className="text-white py-2 hover:text-neon-blue transition-colors text-left"
                        >
                            How It Works
                        </button>
                        <Link
                            href="/auth/login"
                            className="text-white py-2 hover:text-neon-blue transition-colors"
                        >
                            Login
                        </Link>
                        <Link
                            href="/auth/signup"
                            className="text-white py-2 hover:text-neon-blue transition-colors"
                        >
                            Sign Up
                        </Link>
                    </div>
                </motion.div>
            )}
        </nav>
    )
} 