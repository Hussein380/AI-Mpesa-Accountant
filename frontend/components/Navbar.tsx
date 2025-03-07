"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
        <nav className="absolute top-0 left-0 right-0 z-50 py-3 sm:py-4 px-4 sm:px-6">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl sm:text-2xl font-bold text-white">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple">
                        AI-Pesa
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
                    <button
                        onClick={() => scrollToSection('features')}
                        className="text-white hover:text-neon-blue transition-colors cursor-pointer text-sm lg:text-base"
                    >
                        Features
                    </button>
                    <button
                        onClick={() => scrollToSection('how-it-works')}
                        className="text-white hover:text-neon-blue transition-colors cursor-pointer text-sm lg:text-base"
                    >
                        How It Works
                    </button>
                    <Link href="/auth/login" className="px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 bg-black/30 backdrop-blur-sm border border-neon-blue/30 rounded-full text-white hover:bg-black/50 transition-colors text-sm lg:text-base">
                        Login
                    </Link>
                    <Link href="/auth/signup" className="px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full text-white hover:opacity-90 transition-opacity text-sm lg:text-base">
                        Sign Up
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white p-1"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden absolute top-14 left-0 right-0 bg-black/90 backdrop-blur-lg border-b border-neon-blue/20 overflow-hidden"
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
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <Link
                                href="/auth/signup"
                                className="text-white py-2 hover:text-neon-blue transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Sign Up
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
} 