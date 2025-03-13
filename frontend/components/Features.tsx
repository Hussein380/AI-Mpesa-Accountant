"use client"

import { motion } from "framer-motion"
import { Activity, PieChart, MessageSquare, FileText, BarChart } from "lucide-react"

const features = [
  {
    icon: <Activity className="w-10 h-10 text-neon-blue" />,
    title: "Real-Time Insights",
    description: "Instant categorization of M-Pesa transactions.",
  },
  {
    icon: <PieChart className="w-10 h-10 text-neon-purple" />,
    title: "Smart Tracking",
    description: "AI-powered expense categorization and analysis.",
  },
  {
    icon: <MessageSquare className="w-10 h-10 text-neon-pink" />,
    title: "AI Chat Assistant",
    description: "Get financial advice anytime, anywhere.",
  },
  {
    icon: <FileText className="w-10 h-10 text-neon-blue" />,
    title: "Automated Reports",
    description: "Daily and monthly financial summaries.",
  },
  {
    icon: <BarChart className="w-10 h-10 text-neon-purple" />,
    title: "Visual Analytics",
    description: "Interactive charts for better financial understanding.",
  },
]

export default function Features() {
  return (
    <section id="features" className="w-full py-20 bg-gray-900 relative overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url("/data-flow.svg")',
          backgroundSize: "cover",
          opacity: 0.05,
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />
      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-16 text-center subtle-neon-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Futuristic Features
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="glass-effect p-8 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <motion.div className="mb-6" whileHover={{ rotate: 360 }} transition={{ duration: 1 }}>
                {feature.icon}
              </motion.div>
              <h3 className="text-2xl font-semibold mb-4 text-neon-blue">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

