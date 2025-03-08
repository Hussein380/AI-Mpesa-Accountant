# AI-Pesa Tagging Guidelines

This document outlines which files to tag when making prompts to help the AI assistant understand the context and provide more accurate guidance.

## Essential Files to Tag

### Core Backend Files

1. **Controller Files**
   - `backend/src/controllers/ai.controller.js` - When working on AI integration
   - `backend/src/controllers/statement.controller.js` - When working on statement processing
   - `backend/src/controllers/transactionController.ts` - When working on transaction features
   - `backend/src/controllers/auth.controller.js` - When working on authentication
   - `backend/src/controllers/user.controller.js` - When working on user management

2. **Model Files**
   - `backend/src/models/Transaction.ts` - When modifying transaction data structure
   - `backend/src/models/user.model.js` - When working on user-related features
   - `backend/src/models/chat.model.js` - When enhancing chat functionality
   - `backend/src/models/statement.model.js` - When working on statement features

3. **Route Files**
   - `backend/src/routes/ai.routes.js` - When adding/modifying AI endpoints
   - `backend/src/routes/statement.routes.js` - When working on statement endpoints
   - `backend/src/routes/transactions.ts` - When modifying transaction endpoints
   - `backend/src/routes/auth.routes.js` - When working on authentication endpoints

4. **Middleware Files**
   - `backend/src/middleware/auth.middleware.js` - When working on authentication
   - `backend/src/middleware/upload.middleware.js` - When working on file uploads

### Core Frontend Files

1. **Page Files**
   - `frontend/app/dashboard/page.tsx` - When modifying the dashboard
   - `frontend/app/dashboard/ai-chat/page.tsx` - When working on the chat interface
   - `frontend/app/dashboard/upload/page.tsx` - When improving the upload functionality
   - `frontend/app/auth/login/page.tsx` - When working on authentication

2. **Component Files**
   - `frontend/components/Chatbot.tsx` - When enhancing the chat component
   - `frontend/components/DashboardSidebar.tsx` - When modifying navigation
   - `frontend/components/ui/` - When working on UI components

3. **Context Files**
   - `frontend/lib/context/AuthContext.tsx` - When working on authentication
   - `frontend/lib/context/ChatContext.tsx` - When working on chat functionality

4. **Utility Files**
   - `frontend/lib/mpesa-parser.ts` - When working on SMS parsing

## When Working on Specific Improvements

### For AI Integration (Gemini)
- `backend/src/controllers/ai.controller.js`
- `backend/src/routes/ai.routes.js`
- `backend/.env.example` (to see environment variables)
- `docs/API_REFERENCE.md` (for API documentation)
- Any new service files we create

### For Statement Processing
- `backend/src/controllers/statement.controller.js`
- `backend/src/routes/statement.routes.js`
- `frontend/lib/mpesa-parser.ts`
- `frontend/app/dashboard/upload/page.tsx`
- `backend/src/middleware/upload.middleware.js`

### For Data Analysis and Reporting
- `backend/src/controllers/transactionController.ts`
- `backend/src/models/Transaction.ts`
- `frontend/app/dashboard/page.tsx`
- Any new analytics service files

### For User Experience Improvements
- Relevant frontend component files
- `frontend/app/dashboard/page.tsx`
- `frontend/components/` directory files
- CSS/styling files

### For Security and Performance
- `backend/src/middleware/` directory files
- `backend/src/index.js` or `backend/src/index.ts`
- Authentication-related files

## Best Practices for Tagging

1. **Always include the file you want to modify** - This gives direct context on what we're working with.

2. **Include related files** - Tag files that interact with the one you're modifying to help understand dependencies.

3. **Include documentation files** - When relevant, include documentation files from the `docs/` directory to ensure consistency.

4. **For new features**, tag similar existing files as examples.

5. **When in doubt**, include the `docs/IMPROVEMENT.md` file to remind of the overall improvement plan.

## Documentation Files

All documentation files are stored in the `docs/` directory:

- `docs/IMPROVEMENT.md` - Overall improvement plan
- `docs/SYSTEM_OVERVIEW.md` - System architecture and flow
- `docs/API_REFERENCE.md` - API endpoint documentation
- `docs/ARCHITECTURE.md` - Detailed architecture documentation
- `docs/SETUP_GUIDE.md` - Setup and installation instructions
- `docs/DATABASE_SCHEMA.md` - Database schema documentation

By following these guidelines, the AI assistant will have the necessary context to provide more accurate and helpful guidance as we implement improvements to the AI-Pesa system. 