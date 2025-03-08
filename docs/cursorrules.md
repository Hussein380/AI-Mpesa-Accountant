# Cursor Rules for AI-Pesa Project

1. **DO NOT REMOVE OR MODIFY** the following critical components:
   - Dashboard sidebar navigation (`DashboardSidebar.tsx`)
   - Upload statements functionality (`/dashboard/upload/page.tsx`)
   - AI chat interface (`/dashboard/ai-chat/page.tsx`)
   - Authentication system (`AuthContext.tsx`, `ProtectedRoute.tsx`)
   - Dashboard layout structure (`DashboardLayout.tsx`, `DashboardLayoutClient.tsx`)

2. **ALWAYS PRESERVE** the three main dashboard features:
   - Main dashboard with financial summary
   - Upload statements with transaction parsing
   - AI chat with message history

3. **MAINTAIN** the authentication flow:
   - User registration with proper validation
   - User login with JWT token handling
   - Protected routes with trial access for AI chat

4. When making changes to components, **DO NOT BREAK** existing functionality.

5. **ALWAYS TEST** navigation between all dashboard sections after making changes.

6. **ENSURE** responsive design works on both desktop and mobile devices.

7. **VERIFY** that authentication works correctly for both login and signup.

8. When adding new features, integrate them with the existing structure rather than replacing components.

9. **DO NOT CHANGE** the API endpoint structure without updating all corresponding frontend calls.

10. **PRESERVE** the user experience flow between authentication, dashboard, uploads, and AI chat.

Remember: The core value of this application is in its three main features working together with the authentication system. Any changes should enhance, not remove or break these functionalities.