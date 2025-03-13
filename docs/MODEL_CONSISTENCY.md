# Model Consistency Guide

This document outlines our approach to maintaining consistency between frontend and backend models in the AI-Mpesa-Accountant application.

## Overview

To ensure data consistency across the application, we've established a shared type system that mirrors the backend MongoDB models in the frontend TypeScript interfaces.

## Shared Types

All shared types are defined in `frontend/src/types/models.ts`. These TypeScript interfaces match the MongoDB schemas defined in the backend.

### Key Models

1. **Transaction**
   - Backend: `backend/src/models/transaction.model.js`
   - Frontend: `frontend/src/types/models.ts` (Transaction interface)

2. **User**
   - Backend: `backend/src/models/user.model.js`
   - Frontend: `frontend/src/types/models.ts` (User interface)

3. **Statement**
   - Backend: `backend/src/models/statement.model.js`
   - Frontend: `frontend/src/types/models.ts` (Statement interface)

4. **ChatMessage**
   - Backend: `backend/src/models/chat.model.js`
   - Frontend: `frontend/src/types/models.ts` (ChatMessage interface)

## Field Mapping

Each frontend interface includes all fields from the corresponding backend model, with appropriate TypeScript types. For example:

- MongoDB `ObjectId` → TypeScript `string`
- MongoDB `Date` → TypeScript `string` (ISO format)
- MongoDB `Schema.Types.ObjectId` references → TypeScript `string`

## Special Considerations

1. **User References**
   - Backend models often include a `user` field that references the User model
   - In the frontend, this is represented as a string ID

2. **Sensitive Fields**
   - Some fields like `password` in the User model are marked as optional in the frontend interface
   - These fields should never be sent to the client in API responses

3. **Default Values**
   - Backend models often include default values
   - Frontend interfaces mark these fields as optional with `?`

## Best Practices

1. **Keep in Sync**
   - When modifying a backend model, always update the corresponding frontend interface
   - Document any intentional differences

2. **Type Safety**
   - Use the shared types throughout the frontend for type safety
   - Example: `const transaction: Transaction = { ... }`

3. **API Responses**
   - All API responses should follow the standardized format defined in `apiResponse.js`
   - Frontend code should use `processApiResponse<T>()` to handle these responses

## Example Usage

```typescript
// Import shared types
import { Transaction } from '../types/models';

// Use in function signatures
function displayTransaction(transaction: Transaction) {
  // Type-safe access to fields
  console.log(`${transaction.transactionId}: ${transaction.amount}`);
}

// Use with API calls
async function fetchTransaction(id: string): Promise<Transaction> {
  const response = await fetch(`/api/transactions/${id}`);
  return processApiResponse<Transaction>(response);
}
```

By following these guidelines, we ensure that data flows consistently between the frontend and backend, reducing bugs and improving maintainability. 