import type { Metadata } from "next"
import { Inter } from "next/font/google"
import DashboardProtection from "./DashboardProtection"
import DashboardLayoutClient from "@/components/DashboardLayoutClient"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Dashboard | AI-Pesa",
    description: "Your AI-Powered M-Pesa Accountant Dashboard",
}

// Server component for metadata
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-black">
            <DashboardProtection>
                <DashboardLayoutClient>
                    {children}
                </DashboardLayoutClient>
            </DashboardProtection>
        </div>
    )
}
