"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(isDark ? "dark" : "light")
  }, [isDark])

  return (
    <motion.button
      className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-800 text-yellow-400"
      onClick={() => setIsDark(!isDark)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {isDark ? <Sun size={24} /> : <Moon size={24} />}
    </motion.button>
  )
}

