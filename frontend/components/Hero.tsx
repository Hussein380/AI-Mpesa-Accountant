"use client"

import { motion } from "framer-motion"
// Remove these imports as they're causing issues
// import { Canvas } from "@react-three/fiber"
// import { OrbitControls, Box } from "@react-three/drei"
import Link from "next/link"
import TryAIButton from "./TryAIButton"
import Navbar from "./Navbar"

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
      <Navbar />
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
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between py-8 md:py-12">
        {/* Left side - Text content */}
        <div className="lg:w-1/2 mb-10 lg:mb-0 px-4">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 subtle-neon-text relative z-10 leading-tight"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            AI-Pesa: Future of Finance
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl md:text-2xl mb-8 text-blue-200 relative z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          >
            Your AI-Powered M-Pesa Accountant
          </motion.p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <TryAIButton />
            <Link href="/auth/signup">
              <motion.button
                className="px-6 py-3 bg-black/30 backdrop-blur-sm border border-neon-blue/30 rounded-full text-white font-medium shadow-lg hover:bg-black/50 transition-all duration-300 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <span className="mr-2">Sign Up</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Right side - Visual element */}
        <div className="lg:w-1/2 h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] relative mt-8 lg:mt-0">
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

          {/* Content container with fixed dimensions */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="relative w-[80%] max-w-[300px] aspect-square flex flex-col items-center justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {/* Background circle */}
              <motion.div
                className="w-full h-full rounded-full bg-blue-500 opacity-20 absolute"
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

              {/* Text content */}
              <div className="z-10 text-center px-4">
                <motion.div
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
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
                  className="mt-2 md:mt-4 text-blue-200 text-sm sm:text-base md:text-lg"
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

