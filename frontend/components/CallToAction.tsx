"use client"

import { motion } from "framer-motion"
import WhatsAppButton from "./WhatsAppButton"

export default function CallToAction() {
  return (
    <section className="w-full py-20 bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-50"
        style={{
          background: "radial-gradient(circle, var(--neon-blue) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-8 subtle-neon-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Revolutionize Your M-Pesa Experience
        </motion.h2>
        <motion.p
          className="text-xl md:text-2xl mb-12 text-blue-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Step into the future of financial management
        </motion.p>
        <WhatsAppButton />
      </div>
    </section>
  )
}

