# Recent Changes

## Mobile Experience Enhancements (March 13, 2025)

- Improved transaction cards on mobile to eliminate horizontal scrolling
- Added text wrapping and proper spacing for transaction details
- Enhanced SMS paste functionality for mobile devices
- Added a dedicated "Paste from Clipboard" button to help mobile users
- Improved accessibility attributes for form inputs
- Fixed layout issues in the transaction cards on small screens

## Backend ObjectId Constructor Fix (March 12, 2025)

- Fixed ObjectId constructor usage in contextEnrichment.service.js and statement.service.js
- Added the required 'new' keyword before mongoose.Types.ObjectId() calls
- Resolved errors in getTopCategories and buildTransactionQuery methods
- Improved error handling for MongoDB operations

## Mobile-Responsive Transactions (March 12, 2025)

- Enhanced transaction displays to be fully mobile-responsive
- Added card-based layouts for small screens on both dashboard and transactions page
- Improved readability of transaction details on mobile devices
- Optimized spacing and typography for better mobile experience
- Fixed date formatting issues in transaction displays

## Transactions Page Implementation (March 11, 2025)

- Added a dedicated transactions page at `/dashboard/transactions` to view all transactions
- Implemented filtering capabilities by transaction type, date range, and amount
- Added pagination for better performance with large transaction sets
- Included an export feature to download transactions as CSV
- Fixed the "View All Transactions" link on the dashboard

## Gemini Dashboard Integration - Phase 2 (March 10, 2025)

- Added a line chart to visualize spending trends over time
- Enhanced the AI's ability to reference visualizations in responses
- Updated the context enrichment service to provide accurate visualization references
- Added a "Dashboard Reference" badge for messages with visualization references
- Updated documentation to reflect the new features

## Gemini Dashboard Integration - Phase 1 (March 9, 2025)

- Implemented Context Enrichment Service to gather financial data
- Updated Gemini service to utilize financial context in generating responses
- Modified AI controller to incorporate context enrichment
- Added "Personalized" indicator for responses using financial context
- Updated sample questions to reflect new financial analysis capabilities

## Backend Balance Calculation (March 8, 2025)

- Moved balance calculation logic from frontend to backend
- Enhanced transaction controller to provide calculated balance
- Updated dashboard to display backend-calculated balance
- Improved reliability of financial data presentation

## SMS Processing Focus (March 7, 2025)

- Removed PDF upload functionality
- Enhanced SMS processing capabilities
- Updated documentation to reflect the focus on SMS processing
- Simplified the user interface for a more streamlined experience 