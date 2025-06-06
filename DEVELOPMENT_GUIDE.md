# Development Guide for Multi-Tenant Reservation System

## Code Style and Standards

### TypeScript/ESLint Configuration
This project uses ESLint with TypeScript for code quality and consistency. Follow these rules based on the actual `.eslintrc.js` configuration:

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
    reservationTypes,
    requiresApproval,
  },
};

// ❌ Incorrect - Spaces inside braces for simple objects
response.json({ success: true });
```

#### Line Length and Indentation
- **Maximum line length**: 120 characters (configured in ESLint)
- **Indentation**: 2 spaces (configured in ESLint)
- **Break long lines logically**

```typescript
// ✅ Correct - Multi-line for long signatures
export const createTenant = onRequest(async (request, response) => {
  try {
    if (request.method !== "POST") {
      response.status(405).json({error: "Method not allowed"});
      return;
    }
    // implementation
  } catch (error) {
    logger.error("Error creating tenant:", error);
    response.status(500).json({error: "Internal server error"});
  }
});
```

#### Type Safety
```typescript
// ✅ Correct - Avoid 'any', use specific types
details: Record<string, string | number | boolean>;

// ✅ Correct - Use proper type checking
if (!Object.prototype.hasOwnProperty.call(details, field)) {
  // logic
}

// ❌ Warning - Using 'any' (ESLint warns)
details: Record<string, any>;

// ❌ Incorrect - Direct hasOwnProperty
if (!details.hasOwnProperty(field)) {
  // logic
}
```

#### Error Handling Pattern
```typescript
// ✅ Correct - Consistent error response format (current implementation)
if (request.method !== "POST") {
  response.status(405).json({error: "Method not allowed"});
  return;
}

try {
  // business logic
  response.json({
    success: true,
    tenantId,
    message: "Tenant created successfully",
  });
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

#### Current Function Structure (HTTP Functions)
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
    const result = await firestoreService.doSomething(requiredField);

    // 4. Success response
    response.json({
      success: true,
      tenantId: result.id,
      message: "Operation completed successfully",
    });
  } catch (error) {
    logger.error("Error in functionName:", error);
    response.status(500).json({error: "Internal server error"});
  }
});
```

#### Current Function Structure (HTTPS Callable)
```typescript
export const functionName = onCall(async (request) => {
  try {
    // 1. Authentication check
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    // 2. Input validation
    const data = request.data as RequestType;
    if (!data.requiredField) {
      throw new HttpsError("invalid-argument", "Required field missing");
    }

    // 3. Authorization (custom claims)
    if (request.auth.token?.tenantId !== data.tenantId) {
      throw new HttpsError("permission-denied", "Access denied");
    }

    // 4. Business logic
    const result = await firestoreService.doSomething(data);

    // 5. Return response
    return {
      success: true,
      resultId: result,
    };
  } catch (error) {
    logger.error("Error in functionName:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "An unexpected error occurred");
  }
});
```

#### Response Format Standards (Current Implementation)
```typescript
// HTTP Function success responses
response.json({
  success: true,
  tenantId: "tenant_123",  // or relevant ID
  message: "Descriptive success message",
});

// HTTP Function error responses
response.status(400).json({error: "Descriptive error message"});
response.status(404).json({error: "Resource not found"});
response.status(500).json({error: "Internal server error"});

// HTTPS Callable success responses
return {
  success: true,
  reservationId: "result_id",
};

// HTTPS Callable errors (throw HttpsError)
throw new HttpsError("invalid-argument", "Descriptive error message");
```

### Database Patterns (Firestore)

#### Service Method Structure (Current Implementation)
```typescript
async methodName(param: string): Promise<ReturnType | null> {
  const doc = await this.db
    .collection(COLLECTIONS.COLLECTION_NAME)
    .doc(param)
    .get();

  return doc.exists ? doc.data() as ReturnType : null;
}
```

#### Query Patterns (Current Implementation)
```typescript
// Simple tenant-scoped queries
const calendars = await this.db
  .collection(COLLECTIONS.CALENDARS)
  .where("tenantId", "==", tenantId)
  .where("isActive", "==", true)
  .get();

// Complex queries with multiple conditions
let query = this.db.collection(COLLECTIONS.RESERVATIONS);
query = query.where("tenantId", "==", tenantId);
query = query.where("calendarId", "==", calendarId);
query = query.where("status", "in", ["pending", "confirmed"]);

const snapshot = await query.get();
return snapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data() as ReservationDocument,
}));
```

#### Conflict Checking Pattern
```typescript
// Check for overlapping reservations
async checkReservationConflicts(
  tenantId: string,
  calendarId: string,
  startTime: Date,
  endTime: Date
): Promise<Array<ReservationDocument & { id: string }>> {
  const query = this.db.collection(COLLECTIONS.RESERVATIONS)
    .where("tenantId", "==", tenantId)
    .where("calendarId", "==", calendarId)
    .where("status", "!=", "cancelled");

  // Overlap logic: (start < endTime) AND (end > startTime)
  const snapshot = await query
    .where("start", "<", Timestamp.fromDate(endTime))
    .where("end", ">", Timestamp.fromDate(startTime))
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data() as ReservationDocument,
  }));
}
```

### Type Definitions

#### Interface Naming (Current Implementation)
- `Document` suffix for Firestore document interfaces
- `Request` suffix for API request interfaces
- `Response` suffix for API response interfaces
- `Schema` suffix for validation schema interfaces

```typescript
export interface TenantDocument {
  // Firestore document structure
  name: string;
  domain: string;
  schemaConfig: {
    reservationTypes: Record<string, ReservationTypeSchema>;
    // ...
  };
  // ...
}

export interface CreateTenantRequest {
  // API request payload
  name: string;
  domain: string;
  // ...
}

export interface TenantResponse {
  // API response format (with string dates)
  id: string;
  name: string;
  createdAt: string;  // ISO string
  // ...
}

export interface ReservationTypeSchema {
  // Validation schema structure
  fields: SchemaFieldDefinition[];
  requiresApproval: boolean;
  // ...
}
```

#### Timestamp Handling (Current Implementation)
```typescript
// In documents - use Firestore Timestamp
createdAt: Timestamp;
updatedAt: FieldValue.serverTimestamp() as Timestamp;

// In API responses - use ISO strings
const response: TenantResponse = {
  ...tenantData,
  id: docId,
  createdAt: tenantData.createdAt.toDate().toISOString(),
  updatedAt: tenantData.updatedAt.toDate().toISOString(),
};

// In callable functions - ISO string input to Date/Timestamp
const startDate = new Date(data.start);  // data.start is ISO string
const startTimestamp = Timestamp.fromDate(startDate);
```

#### Collection Constants (Current Implementation)
```typescript
export const COLLECTIONS = {
  TENANTS: "tenants",
  CALENDARS: "calendars",
  RESERVATIONS: "reservations",
  USERS: "users",
} as const;

// Usage in service methods
await this.db.collection(COLLECTIONS.TENANTS).doc(tenantId).get();
```

## Development Commands

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode for development
npm run build:watch

# Run linting
npm run lint

# Fix auto-fixable linting issues
npm run lint -- --fix

# Start Firebase emulator (from functions directory)
npm run serve

# Start Firebase emulator (from project root)
firebase emulators:start

# Deploy functions only
npm run deploy

# View function logs
npm run logs
```

## Project Structure Notes

```
functions/
├── .eslintrc.js          # ESLint configuration (actual rules)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── src/
│   ├── index.ts          # Main functions entry point
│   ├── models/
│   │   └── firestore-types.ts    # All TypeScript interfaces
│   └── services/
│       └── firestore.service.ts  # Database operations
└── lib/                  # Compiled JavaScript (generated)
```

## Key Points for Development

1. **Always use double quotes** for strings
2. **No spaces inside braces** for simple objects/imports
3. **Maximum 120 characters per line** (ESLint enforced)
4. **2-space indentation** (ESLint enforced)
5. **Avoid `any` type** - ESLint warns, use specific union types
6. **Use `Object.prototype.hasOwnProperty.call()`** instead of direct `.hasOwnProperty()`
7. **Consistent error handling** with proper HTTP status codes
8. **JSDoc comments are optional** (disabled in ESLint)
9. **Always add trailing commas** in multi-line objects/arrays
10. **Use proper Firebase Timestamp handling** for date/time fields
11. **Follow the established patterns** for functions, services, and types
12. **Tenant isolation** - always filter by `tenantId` in database queries
13. **Custom claims validation** - check `tenantId` and `roles` in callable functions
