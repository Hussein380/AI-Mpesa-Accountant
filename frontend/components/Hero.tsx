"use client"

import { motion } from "framer-motion"
// Remove these imports as they're causing issues
// import { Canvas } from "@react-three/fiber"
// import { OrbitControls, Box } from "@react-three/drei"
import WhatsAppButton from "./WhatsAppButton"

// Remove the 3D model function
// function AIPesaModel() {
//   return (
//     <Box args={[1, 1, 1]}>
//       <meshStandardMaterial color="hotpink" />
//     </Box>
//   )
// }

export default function Hero() {
  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden cyber-grid">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 opacity-30"
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
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url("/circuit-pattern.svg")',
          backgroundSize: "cover",
          opacity: 0.1,
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between">
        <div className="lg:w-1/2 mb-10 lg:mb-0">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-4 subtle-neon-text relative z-10"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            AI-Pesa: Future of Finance
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 text-blue-200 relative z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          >
            Your AI-Powered M-Pesa Accountant
          </motion.p>
          <WhatsAppButton />
        </div>
        <div className="lg:w-1/2 h-[400px] relative">
          <motion.div
            className="absolute inset-0 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 opacity-30"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(79, 70, 229, 0.4) 0%, transparent 70%)',
              backgroundSize: '120% 120%',
              backgroundPosition: 'center'
            }}></div>
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: 'linear-gradient(45deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
                backgroundSize: '200% 200%'
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            ></motion.div>
          </motion.div>

          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="relative">
              <motion.div
                className="w-64 h-64 rounded-full bg-blue-500 opacity-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              ></motion.div>
              <motion.div
                className="text-5xl font-bold text-white"
                animate={{
                  textShadow: ['0 0 8px rgba(59, 130, 246, 0.8)', '0 0 16px rgba(147, 51, 234, 0.8)', '0 0 8px rgba(59, 130, 246, 0.8)']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                AI-Pesa
              </motion.div>
              <motion.div
                className="mt-4 text-blue-200 text-lg"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                Intelligent Financial Assistant
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neon-blue to-transparent opacity-20"
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />
    </section>
  )
}

