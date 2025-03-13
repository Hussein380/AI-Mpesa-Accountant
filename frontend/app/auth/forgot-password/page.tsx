"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            // This is a placeholder for the actual password reset logic
            // In a real implementation, you would call your backend API
            console.log("Password reset request for:", email)

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Show success message
            setIsSubmitted(true)
        } catch (err) {
            setError("Failed to send reset link. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-bg to-cyber-grid p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-black/30 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-neon-blue/20">
                    <div className="p-8">
                        {!isSubmitted ? (
                            <>
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                                    <p className="text-text-secondary">Enter your email to receive a password reset link</p>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg mb-6"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-6">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue text-white"
                                                placeholder="you@example.com"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-3 px-4 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-lg font-medium flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-70"
                                        >
                                            {isLoading ? (
                                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    Send Reset Link <ArrowRight className="ml-2" size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-6"
                            >
                                <div className="flex justify-center mb-4">
                                    <CheckCircle className="w-16 h-16 text-green-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                                <p className="text-text-secondary mb-6">
                                    We've sent a password reset link to <span className="text-neon-blue">{email}</span>
                                </p>
                                <p className="text-sm text-text-secondary mb-6">
                                    If you don't see the email, check your spam folder or request another link.
                                </p>
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-neon-blue hover:text-neon-purple transition-colors"
                                >
                                    Try another email
                                </button>
                            </motion.div>
                        )}

                        <div className="mt-8 text-center">
                            <p className="text-text-secondary">
                                Remember your password?{" "}
                                <Link href="/auth/login" className="text-neon-blue hover:text-neon-purple transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-text-secondary hover:text-white transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </motion.div>
        </div>
    )
} 