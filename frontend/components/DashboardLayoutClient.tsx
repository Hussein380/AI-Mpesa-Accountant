"use client"

import { useState, useEffect } from "react"
import DashboardSidebar from "@/components/DashboardSidebar"

export default function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Set sidebar state based on screen size
    useEffect(() => {
        // Function to handle resize
        const handleResize = () => {
            // On large screens (lg breakpoint in Tailwind is 1024px)
            // sidebar should be open by default, on small screens it should be closed
            setSidebarOpen(window.innerWidth >= 1024);
        };

        // Set initial state
        handleResize();

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-gray-900 text-white overflow-hidden">
            <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Main content */}
            <div className="flex-1 overflow-auto w-full max-w-full">
                <div className="min-h-screen w-full max-w-full">
                    {children}
                </div>
            </div>
        </div>
    )
} 