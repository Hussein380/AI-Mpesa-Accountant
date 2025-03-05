"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react"
import { useAuth } from "@/lib/context/AuthContext"

export default function SignupPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()
    const { signup } = useAuth()

    const passwordStrength = () => {
        if (!password) return 0
        let score = 0
        if (password.length > 8) score += 1
        if (/[A-Z]/.test(password)) score += 1
        if (/[0-9]/.test(password)) score += 1
        if (/[^A-Za-z0-9]/.test(password)) score += 1
        return score
    }

    const getPasswordStrengthText = () => {
        const strength = passwordStrength()
        if (strength === 0) return ""
        if (strength === 1) return "Weak"
        if (strength === 2) return "Fair"
        if (strength === 3) return "Good"
        return "Strong"
    }

    const getPasswordStrengthColor = () => {
        const strength = passwordStrength()
        if (strength === 1) return "bg-red-500"
        if (strength === 2) return "bg-yellow-500"
        if (strength === 3) return "bg-blue-500"
        if (strength === 4) return "bg-green-500"
        return "bg-gray-300"
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (passwordStrength() < 2) {
            setError("Please use a stronger password")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            // Call the signup function from AuthContext with name, email, and password
            await signup(name, email, password)
            // No need to redirect here as the AuthContext will handle it
        } catch (err: any) {
            setError(err.message || "Failed to create account. Please try again.")
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
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                            <p className="text-text-secondary">Join AI-Pesa to manage your finances</p>
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
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue text-white"
                                        placeholder="John Doe"
                                    />
                                </div>

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

                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-text-secondary mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        id="phoneNumber"
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue text-white"
                                        placeholder="+254 7XX XXX XXX"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue text-white pr-10"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>

                                    {password && (
                                        <div className="mt-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="text-xs text-text-secondary">Password strength:</div>
                                                <div className="text-xs font-medium" style={{ color: passwordStrength() >= 3 ? '#00a8ff' : passwordStrength() === 2 ? '#ffbb00' : '#ff4d4d' }}>
                                                    {getPasswordStrengthText()}
                                                </div>
                                            </div>
                                            <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${getPasswordStrengthColor()}`}
                                                    style={{ width: `${passwordStrength() * 25}%` }}
                                                ></div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <div className="flex items-center text-xs">
                                                    <div className={`w-3 h-3 rounded-full mr-2 flex items-center justify-center ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-700'}`}>
                                                        {/[A-Z]/.test(password) && <Check size={10} className="text-white" />}
                                                    </div>
                                                    <span className="text-text-secondary">Capital letter</span>
                                                </div>
                                                <div className="flex items-center text-xs">
                                                    <div className={`w-3 h-3 rounded-full mr-2 flex items-center justify-center ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-700'}`}>
                                                        {/[0-9]/.test(password) && <Check size={10} className="text-white" />}
                                                    </div>
                                                    <span className="text-text-secondary">Number</span>
                                                </div>
                                                <div className="flex items-center text-xs">
                                                    <div className={`w-3 h-3 rounded-full mr-2 flex items-center justify-center ${/[^A-Za-z0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-700'}`}>
                                                        {/[^A-Za-z0-9]/.test(password) && <Check size={10} className="text-white" />}
                                                    </div>
                                                    <span className="text-text-secondary">Special character</span>
                                                </div>
                                                <div className="flex items-center text-xs">
                                                    <div className={`w-3 h-3 rounded-full mr-2 flex items-center justify-center ${password.length > 8 ? 'bg-green-500' : 'bg-gray-700'}`}>
                                                        {password.length > 8 && <Check size={10} className="text-white" />}
                                                    </div>
                                                    <span className="text-text-secondary">8+ characters</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className={`w-full px-4 py-3 bg-black/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue text-white pr-10 ${confirmPassword && password !== confirmPassword ? "border-red-500" : "border-gray-700"
                                                }`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-lg font-medium flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-70 mt-6"
                                >
                                    {isLoading ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Create Account <ArrowRight className="ml-2" size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-text-secondary">
                                Already have an account?{" "}
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