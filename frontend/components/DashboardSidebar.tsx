"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Home, FileUp, MessageSquare, Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"

interface DashboardSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function DashboardSidebar({ sidebarOpen, setSidebarOpen }: DashboardSidebarProps) {
    const pathname = usePathname();

    // Handle clicks outside the sidebar to close it on mobile
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            // Only apply this on mobile screens
            if (window.innerWidth < 1024) {
                const target = e.target as HTMLElement;
                // Check if the click is outside the sidebar and not on the menu button
                if (
                    sidebarOpen &&
                    !target.closest('[data-sidebar]') &&
                    !target.closest('[data-sidebar-toggle]')
                ) {
                    setSidebarOpen(false);
                }
            }
        };

        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, [sidebarOpen, setSidebarOpen]);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    }, [pathname, setSidebarOpen]);

    return (
        <>
            {/* Mobile overlay - only visible when sidebar is open on mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <motion.div
                data-sidebar
                className={`fixed inset-y-0 left-0 z-50 w-56 sm:w-60 md:w-64 bg-gray-800 p-4 shadow-lg transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                initial={false}
                animate={{ x: sidebarOpen ? 0 : -256 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-xl font-bold text-blue-400">AI-Pesa</h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1 rounded-md hover:bg-gray-700 lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="space-y-2">
                    <Link
                        href="/dashboard"
                        className={`flex items-center px-4 py-3 rounded-md transition-colors ${pathname === "/dashboard"
                            ? "text-white bg-blue-600"
                            : "text-gray-300 hover:bg-gray-700"
                            }`}
                        onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                    >
                        <Home className="h-5 w-5 mr-3" />
                        Dashboard
                    </Link>
                    <Link
                        href="/dashboard/upload"
                        className={`flex items-center px-4 py-3 rounded-md transition-colors ${pathname === "/dashboard/upload"
                            ? "text-white bg-blue-600"
                            : "text-gray-300 hover:bg-gray-700"
                            }`}
                        onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                    >
                        <FileUp className="h-5 w-5 mr-3" />
                        Upload Statements
                    </Link>
                    <Link
                        href="/dashboard/ai-chat"
                        className={`flex items-center px-4 py-3 rounded-md transition-colors ${pathname === "/dashboard/ai-chat"
                            ? "text-white bg-blue-600"
                            : "text-gray-300 hover:bg-gray-700"
                            }`}
                        onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                    >
                        <MessageSquare className="h-5 w-5 mr-3" />
                        AI Chat
                    </Link>
                </nav>
            </motion.div>

            {/* Mobile header */}
            <div className="lg:hidden bg-gray-800 p-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-blue-400">AI-Pesa</h1>
                <button
                    data-sidebar-toggle
                    onClick={() => setSidebarOpen(true)}
                    className="p-1 rounded-md hover:bg-gray-700"
                    aria-label="Open sidebar"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>
        </>
    );
} 