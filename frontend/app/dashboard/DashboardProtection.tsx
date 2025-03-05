"use client"

import { usePathname } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function DashboardProtection({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAIChatPage = pathname === "/dashboard/ai-chat"

    return (
        <ProtectedRoute allowTrial={isAIChatPage}>
            {children}
        </ProtectedRoute>
    )
} 