"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, ChevronRight } from "lucide-react"
import { faqs } from "@/data/faq"

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ type: "bot" | "user"; text: string }[]>([])
  const [showQuestions, setShowQuestions] = useState(false)

  const introduction = "Hello! I'm Huzni, your AI assistant for today. Here are the questions I can help you answer:"

  useEffect(() => {
    if (isOpen) {
      setMessages([{ type: "bot", text: introduction }])
      setShowQuestions(true)
    } else {
      setMessages([])
      setShowQuestions(false)
    }
  }, [isOpen])

  const handleQuestionClick = (question: string) => {
    setMessages((prev) => [...prev, { type: "user", text: question }])
    const answer =
      faqs.find((faq) => faq.question === question)?.answer || "I'm sorry, I don't have an answer for that question."
    setTimeout(() => {
      setMessages((prev) => [...prev, { type: "bot", text: answer }])
    }, 500)
    setShowQuestions(false)
  }

  const handleCustomMessage = () => {
    setMessages((prev) => [
      ...prev,
      {
        type: "bot",
        text: "I'm sorry, I can only answer the predefined questions at the moment. For more help, please contact +254725996394. Thank you!",
      },
    ])
  }

  return (
    <>
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="bg-neon-blue text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-300"
        >
          <MessageCircle size={24} />
        </button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-4 right-4 w-96 h-[32rem] bg-gray-900 rounded-lg shadow-xl z-50 flex flex-col"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="text-white font-semibold">Chat with Huzni</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-2 rounded-lg ${message.type === "user" ? "bg-neon-blue text-white" : "bg-gray-800 text-gray-300"}`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
            {showQuestions && (
              <div className="p-4 border-t border-gray-800 space-y-2 max-h-48 overflow-y-auto">
                {faqs.map((faq, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(faq.question)}
                    className="w-full text-left p-2 rounded bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-300 flex justify-between items-center"
                  >
                    <span className="text-sm">{faq.question}</span>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            )}
            {!showQuestions && (
              <div className="p-4 border-t border-gray-800">
                <button
                  onClick={() => setShowQuestions(true)}
                  className="w-full p-2 rounded bg-neon-blue text-white hover:bg-blue-600 transition-colors duration-300"
                >
                  Show questions again
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

