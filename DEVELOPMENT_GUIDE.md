# Development Guide for Multi-Tenant Reservation System

## Code Style and Standards

### TypeScript/ESLint Configuration
This project uses ESLint with TypeScript for code quality and consistency. Follow these rules:

#### Import/Export Style
```typescript
// ✅ Correct - No spaces inside braces
import {onRequest} from "firebase-functions/v2/https";
import {initializeApp} from "firebase-admin/app";

// ❌ Incorrect - Spaces inside braces
import { onRequest } from "firebase-functions/v2/https";
```

#### String Quotes
```typescript
// ✅ Correct - Always use double quotes
const message = "Hello World";
const error = "Method not allowed";

// ❌ Incorrect - Single quotes
const message = 'Hello World';
```

#### Object Formatting
```typescript
// ✅ Correct - No spaces inside braces for simple objects
response.json({success: true, message: "Created successfully"});

// ✅ Correct - Multi-line for complex objects
const complexObject = {
  name,
  domain,
  schemaConfig: {
    reservationFields,
    requiresApproval,
  },
};

// ❌ Incorrect - Spaces inside braces
response.json({ success: true });
```

#### Line Length
- Maximum line length: 120 characters
- Break long lines logically
- Use multi-line formatting for complex function signatures

```typescript
// ✅ Correct - Multi-line for long signatures
async createReservation(
  reservationId: string,
  data: CreateReservationRequest
): Promise<void> {
  // implementation
}

// ✅ Correct - Multi-line for long interfaces
export interface ReservationResponse extends Omit<
  ReservationDocument,
  "start" | "end" | "createdAt" | "updatedAt" | "approvedAt"
> {
  // properties
}
```

#### Type Safety
```typescript
// ✅ Correct - Avoid 'any', use specific types
details: Record<string, string | number | boolean>;

// ✅ Correct - Use proper type checking
if (!Object.prototype.hasOwnProperty.call(details, field)) {
  // logic
}

// ❌ Incorrect - Using 'any'
details: Record<string, any>;

// ❌ Incorrect - Direct hasOwnProperty
if (!details.hasOwnProperty(field)) {
  // logic
}
```

#### Error Handling
```typescript
// ✅ Correct - Consistent error response format
if (request.method !== "POST") {
  response.status(405).json({error: "Method not allowed"});
  return;
}

try {
  // logic
} catch (error) {
  logger.error("Error creating tenant:", error);
  response.status(500).json({error: "Internal server error"});
}
```

### File Structure Rules

#### Functions Directory (`functions/src/`)
- **index.ts**: Main entry point with Firebase Functions exports
- **models/**: TypeScript interfaces and types
- **services/**: Business logic and database operations

#### Import Organization
```typescript
// 1. External libraries
import {onRequest} from "firebase-functions/v2/https";
import {initializeApp} from "firebase-admin/app";
import * as logger from "firebase-functions/logger";

// 2. Internal modules (relative imports)
import {firestoreService} from "./services/firestore.service";
import {TenantDocument} from "./models/firestore-types";
```

### Firebase Functions Patterns

#### Function Structure
```typescript
export const functionName = onRequest(async (request, response) => {
  try {
    // 1. Method validation
    if (request.method !== "POST") {
      response.status(405).json({error: "Method not allowed"});
      return;
    }

    // 2. Input validation
    const {requiredField, optionalField = defaultValue} = request.body;
    if (!requiredField) {
      response.status(400).json({error: "Required field missing"});
      return;
    }

    // 3. Business logic
    const result = await service.doSomething(requiredField);

    // 4. Success response
    response.json({
      success: true,
      data: result,
      message: "Operation completed successfully",
    });
  } catch (error) {
    logger.error("Error in functionName:", error);
    response.status(500).json({error: "Internal server error"});
  }
});
```

#### Response Format Standards
```typescript
// Success responses
response.json({
  success: true,
  data: result,
  message: "Descriptive success message",
});

// Error responses
response.status(400).json({error: "Descriptive error message"});
response.status(404).json({error: "Resource not found"});
response.status(500).json({error: "Internal server error"});
```

### Database Patterns (Firestore)

#### Service Method Structure
```typescript
async methodName(param: string): Promise<ReturnType> {
  const doc = await this.db
    .collection(COLLECTIONS.COLLECTION_NAME)
    .doc(param)
    .get();

  return doc.exists ? doc.data() as ReturnType : null;
}
```

#### Query Patterns
```typescript
// Simple queries
const query = this.db
  .collection(COLLECTIONS.TENANTS)
  .where("field", "==", value);

// Complex queries with multiple conditions
let query = this.db.collection(COLLECTIONS.RESERVATIONS);
query = query.where("tenantId", "==", tenantId);

if (status) {
  query = query.where("status", "==", status);
}

const snapshot = await query.get();
return snapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data() as DocumentType,
}));
```

### Type Definitions

#### Interface Naming
- `Document` suffix for Firestore document interfaces
- `Request` suffix for API request interfaces
- `Response` suffix for API response interfaces

```typescript
export interface TenantDocument {
  // Firestore document structure
}

export interface CreateTenantRequest {
  // API request payload
}

export interface TenantResponse {
  // API response format
}
```

#### Timestamp Handling
```typescript
// In documents - use Firestore Timestamp
createdAt: Timestamp;

// In API responses - use ISO strings
createdAt: string;

// Conversion pattern
const response: TenantResponse = {
  ...tenantData,
  createdAt: tenantData.createdAt.toDate().toISOString(),
};
```

## Development Commands

```bash
# Build TypeScript
npm run build

# Watch mode for development
npm run build:watch

# Run linting
npm run lint

# Fix auto-fixable linting issues
npm run lint -- --fix

# Start Firebase emulator
npm run serve
```

## Key Points for Copilot

1. **Always use double quotes** for strings
2. **No spaces inside braces** for simple objects/imports
3. **Maximum 120 characters per line**
4. **Avoid `any` type** - use specific union types
5. **Use `Object.prototype.hasOwnProperty.call()`** instead of direct `.hasOwnProperty()`
6. **Consistent error handling** with proper HTTP status codes
7. **JSDoc comments are optional** (disabled in ESLint)
8. **Always add trailing commas** in multi-line objects/arrays
9. **Use proper Firebase Timestamp handling** for date/time fields
10. **Follow the established patterns** for functions, services, and types
