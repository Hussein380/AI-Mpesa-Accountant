import type { Metadata } from "next"
import { Inter } from "next/font/google"
import DashboardLayoutClient from "@/components/DashboardLayoutClient"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Dashboard | AI-Pesa",
    description: "Your AI-Powered M-Pesa Accountant Dashboard",
}

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950">
            <DashboardLayoutClient>
                {children}
            </DashboardLayoutClient>
        </div>
    )
}
