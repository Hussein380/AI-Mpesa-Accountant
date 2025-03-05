"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'

export default function ProtectedRoute({
    children,
    allowTrial = false
}: {
    children: React.ReactNode,
    allowTrial?: boolean
}) {
    const { isAuthenticated, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !isAuthenticated && !allowTrial) {
            router.push('/auth/login')
        }
    }, [isAuthenticated, loading, router, allowTrial])

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // If not authenticated and not allowing trial, don't render children
    // (useEffect will redirect)
    if (!isAuthenticated && !allowTrial) {
        return null
    }

    // If authenticated or allowing trial, render children
    return <>{children}</>
} 