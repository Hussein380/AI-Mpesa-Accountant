"use client"

import { ReactNode } from "react"
import { ChatProvider } from "@/lib/context/ChatContext"
import { AuthProvider } from "@/lib/context/AuthContext"

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ChatProvider>
                {children}
            </ChatProvider>
        </AuthProvider>
    )
} 