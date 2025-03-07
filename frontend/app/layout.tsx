import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "./Providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AI-Pesa: Your AI-Powered M-Pesa Accountant",
  description: "Track your transactions, get instant insights, and manage your money—all with AI-Pesa!",
  generator: 'v0.dev'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}