"use client"

import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "./Providers"

const inter = Inter({ subsets: ["latin"] })

// Metadata needs to be in a separate file or a server component
// since 'use client' directive makes this a client component
const siteConfig = {
  title: "AI-Pesa: Your AI-Powered M-Pesa Accountant",
  description: "Track your transactions, get instant insights, and manage your money—all with AI-Pesa!",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>{siteConfig.title}</title>
        <meta name="description" content={siteConfig.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}