import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Check for token in localStorage (client-side)
    // For server-side middleware, we can't access localStorage directly
    // Instead, we'll check for a specific URL pattern or route
    const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
    const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
    const isAIChatPage = request.nextUrl.pathname === '/dashboard/ai-chat'

    // Allow public access to AI chat for trial
    if (isAIChatPage) {
        return NextResponse.next()
    }

    // For other routes, we'll rely on client-side auth checks
    // This is because we can't access localStorage from middleware
    // The actual auth protection will happen in the components

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/auth/:path*']
} 