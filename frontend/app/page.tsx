import Hero from "@/components/Hero"
import Features from "@/components/Features"
import HowItWorks from "@/components/HowItWorks"
import TillAgentIntegration from "@/components/TillAgentIntegration"
import Pricing from "@/components/Pricing"
import Testimonials from "@/components/Testimonials"
import CallToAction from "@/components/CallToAction"
import Chatbot from "@/components/Chatbot"
import ThemeToggle from "@/components/ThemeToggle"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between relative">
      <ThemeToggle />
      <Hero />
      <Features />
      <HowItWorks />
      <TillAgentIntegration />
      <Pricing />
      <Testimonials />
      <CallToAction />
      <Chatbot />
    </main>
  )
}

