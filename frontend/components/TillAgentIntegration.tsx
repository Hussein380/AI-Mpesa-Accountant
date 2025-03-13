"use client"

import { motion } from "framer-motion"
import { DollarSign, ShoppingCart, Users } from "lucide-react"

const features = [
  {
    icon: <DollarSign className="w-10 h-10 text-neon-blue" />,
    title: "Seamless Payments",
    description: "Integrate your Till number for easy customer payments.",
  },
  {
    icon: <ShoppingCart className="w-10 h-10 text-neon-purple" />,
    title: "Business Transactions",
    description: "Track all your business transactions in one place.",
  },
  {
    icon: <Users className="w-10 h-10 text-neon-pink" />,
    title: "Agent Management",
    description: "Manage your agents and their transactions efficiently.",
  },
]

export default function TillAgentIntegration() {
  return (
    <section className="w-full py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-16 text-center subtle-neon-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Till & Agent Integration
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-gray-800 p-8 rounded-lg neon-border"
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
        <motion.p
          className="text-center mt-12 text-xl text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Monetize your AI-Pesa integration by seamlessly connecting your Till and Agent numbers.
        </motion.p>
      </div>
    </section>
  )
}

