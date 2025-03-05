"use client"

import { motion } from "framer-motion"
import { MessageCircle, Send, PieChart, FileDown } from "lucide-react"

const steps = [
  {
    icon: <MessageCircle className="w-12 h-12 text-neon-blue" />,
    title: "Initiate Chat",
    description: "Start your AI journey with a simple WhatsApp message.",
  },
  {
    icon: <Send className="w-12 h-12 text-neon-purple" />,
    title: "Share M-Pesa Data",
    description: "Securely forward your transaction messages.",
  },
  {
    icon: <PieChart className="w-12 h-12 text-neon-pink" />,
    title: "AI Analysis",
    description: "Watch as AI-Pesa decodes your financial patterns.",
  },
  {
    icon: <FileDown className="w-12 h-12 text-neon-blue" />,
    title: "Smart Reports",
    description: "Access detailed insights and visualizations.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-20 bg-gray-950 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-16 text-center subtle-neon-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          AI-Powered Workflow
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                className="mb-6 bg-gray-800 p-6 rounded-full neon-border"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {step.icon}
              </motion.div>
              <h3 className="text-2xl font-semibold mb-4 text-neon-purple">{step.title}</h3>
              <p className="text-gray-300">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

