"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

const testimonials = [
  {
    name: "Mohamade Idris",
    role: "Small Business Owner in Eastleigh Nairobi",
    content:
      "AI-Pesa has revolutionized how I manage my M-Pesa transactions. It's like having a personal accountant in my pocket!",
  },
  {
    name: "Jane wanjiru",
    role: "Freelancer",
    content:
      "The real-time insights have helped me make better financial decisions. I can't imagine managing my finances without AI-Pesa now.",
  },
  {
    name: "David Juma",
    role: "M-Pesa Agent",
    content:
      "As an M-Pesa agent, AI-Pesa has streamlined my operations and improved my efficiency. It's a game-changer for my business.",
  },
]

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="w-full py-20 bg-gray-900 relative overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url("/testimonial-bg.svg")',
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
          What Our Users Say
        </motion.h2>
        <div className="max-w-4xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="glass-effect p-8 rounded-lg text-center"
            >
              <p className="text-xl mb-4">{testimonials[currentIndex].content}</p>
              <p className="font-bold">{testimonials[currentIndex].name}</p>
              <p className="text-sm text-gray-400">{testimonials[currentIndex].role}</p>
            </motion.div>
          </AnimatePresence>
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 p-2 rounded-full"
          >
            <ChevronLeft className="text-white" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 p-2 rounded-full"
          >
            <ChevronRight className="text-white" />
          </button>
        </div>
      </div>
    </section>
  )
}

