"use client"

import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

const tiers = [
  {
    name: "Free",
    price: "0",
    description: "For individual M-Pesa users",
    features: ["Real-time transaction insights", "Basic expense tracking", "Daily summaries", "WhatsApp integration"],
    notIncluded: ["Business analytics", "Multiple account management", "Priority support"],
  },
  {
    name: "Business",
    price: "300",
    description: "For M-Pesa agents, Paybill, and Till users",
    features: [
      "All Free tier features",
      "Advanced business analytics",
      "Multiple account management",
      "Priority support",
      "Custom reports",
      "API access",
    ],
    notIncluded: [],
  },
]

export default function Pricing() {
  return (
    <section className="w-full py-20 bg-gray-900 relative overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url("/pricing-bg.svg")',
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
          Choose Your Plan
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              className="bg-gray-800 bg-opacity-50 rounded-lg p-8 backdrop-filter backdrop-blur-sm neon-border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="text-2xl font-bold mb-4 text-neon-blue">{tier.name}</h3>
              <p className="text-4xl font-bold mb-4">
                {tier.price === "0" ? "Free" : `${tier.price} KES`}
                {tier.price !== "0" && <span className="text-xl font-normal">/month</span>}
              </p>
              <p className="text-gray-400 mb-6">{tier.description}</p>
              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
                {tier.notIncluded.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-500">
                    <X className="w-5 h-5 mr-2 text-red-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <motion.button
                className="w-full py-2 px-4 bg-neon-blue text-white rounded-md hover:bg-blue-600 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tier.price === "0" ? "Get Started" : "Subscribe Now"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

