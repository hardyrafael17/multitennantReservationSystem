# Multi-Tenant Reservation System - Project Architecture

## 🏗️ Project Overview

This is a **multi-tenant reservation system** built with Firebase services, designed to allow multiple organizations (tenants) to manage their own reservations independently while sharing the same infrastructure.

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Architecture Patterns](#architecture-patterns)
- [Firebase Configuration](#firebase-configuration)
- [Security Model](#security-model)
- [Development Guidelines](#development-guidelines)
- [Deployment Instructions](#deployment-instructions)
- [Firestore Collections & Document Structures](#firestore-collections--document-structures)

---

## 📁 Project Structure

```
multitennantReservationSystem/
├── .firebaserc                    # Firebase project configuration
├── .gitignore                     # Git ignore patterns
├── firebase.json                  # Firebase services configuration
├── firestore.indexes.json         # Firestore database indexes
├── firestore.rules               # Multi-tenant security rules
├── PROJECT_ARCHITECTURE.md       # 📖 This documentation file
├── README.md                      # Project setup and usage guide
├── public/                        # 🌐 Static frontend (HTML, CSS, JS)
│   ├── index.html                # Main HTML page
│   ├── app.js                    # Frontend JavaScript logic
│   └── style.css                 # Basic styling
└── functions/                     # ☁️ Cloud Functions (TypeScript)
    ├── .eslintrc.js              # ESLint configuration
    ├── .gitignore                # Functions-specific git ignore
    ├── package.json              # Node.js dependencies
    ├── package-lock.json         # Dependency lock file
    ├── tsconfig.json             # TypeScript configuration
    ├── tsconfig.dev.json         # Development TypeScript config
    ├── node_modules/             # Installed dependencies
    └── src/                      # 📝 Source code
        ├── index.ts              # Main functions entry point
│       ├── models/               # 📊 Data models and interfaces
│       │   └── firestore-types.ts
│       └── services/             # 🔧 Business logic services
│           └── firestore.service.ts
└── public/                       # 🌐 Frontend application (static website)
    ├── index.html                # Main entry point and structure
    ├── app.js                    # Firebase initialization and auth logic
    └── style.css                 # Basic styling
```

---

## 🛠️ Technology Stack

### **Backend Services**
- **Firebase Cloud Functions** - Serverless backend API
- **Cloud Firestore** - NoSQL document database
- **Firebase Authentication** - User authentication & authorization
- **Firebase Hosting** - Static website hosting (configured for `public/` directory)

### **Frontend**
- **HTML5** - Markup structure
- **CSS3** - Styling and responsive design
- **JavaScript (ES6+)** - Client-side logic and Firebase SDK integration
- **Firebase SDK** - Authentication and API communication

### **Languages & Frameworks**
- **TypeScript** - Primary development language for backend
- **Node.js** - Runtime environment
- **ESLint** - Code linting and formatting

### **Development Tools**
- **Firebase CLI** - Project management and deployment
- **npm** - Package management

---

## 🏛️ Architecture Patterns

### **Multi-Tenancy Model**
- **Tenant Isolation**: Each tenant's data is logically separated using tenantId fields
- **Shared Infrastructure**: All tenants use the same Firebase project
- **Row-Level Security**: Firestore rules enforce tenant boundaries through tenantId validation

### **Data Architecture**
```
Firestore Database Structure (Current Implementation):
├── tenants/{tenantId}                           # Tenant organizations
├── calendars/{calendarId}                       # Calendars with tenantId field
├── reservations/{reservationId}                 # Reservations with tenantId field
└── users/{userId}                               # User profiles with tenantId field

Note: Uses flat collection structure with tenantId-based filtering,
not hierarchical subcollections as originally planned.
```

### **Security Architecture**
- **Authentication-First**: All operations require valid Firebase Auth
- **Tenant-Scoped Access**: Users can only access their tenant's data
- **Role-Based Permissions**: Different access levels within tenants

---

## 🔧 Firebase Configuration

### **Project Details**
- **Project ID**: `gastby-navarenas`
- **Display Name**: "Multi-Tenant Reservation System"

### **Enabled Services**
- ✅ Cloud Firestore
- ✅ Cloud Functions
- ✅ Firebase Hosting (configured for `public/` directory)
- ✅ Firebase Authentication (to be configured)
- 🔲 Firebase Storage (future)

### **Configuration Files**
- `firebase.json` - Service configurations
- `.firebaserc` - Project aliases
- `firestore.rules` - Database security rules
- `firestore.indexes.json` - Query optimization indexes

---

## 🔒 Security Model

### **Multi-Tenant Authentication Strategy**
- **Custom Claims**: Users have `tenantId` and `roles` (array) in their JWT token
- **Tenant Assignment**: Users are assigned to tenants during registration
- **Role Management**: Array-based roles supported - `admin`, `staff`, `user` within tenant scope

### **Firestore Security Rules Implementation**
The security rules enforce strict tenant isolation and role-based access control. Key features:

- **Tenant Isolation**: Users can only access data for their assigned tenant
- **Array-Based Roles**: Updated from single role to array of roles for flexible permissions
- **Hierarchical Data Structure**: New tenant-based subcollections for better data organization
- **Resource Protection**: Calendars, reservations, and other resources have appropriate read/write restrictions
- **Self-Service**: Users can manage their own profiles and reservations with limitations
- **Backward Compatibility**: Legacy flat structure maintained during migration period

### **Security Rule Structure**
```
Helper Functions:
├── isAuthenticated()                    # Check user authentication
├── isTenantMember(tenantId)            # Validate tenant membership
├── isTenantAdmin(tenantId)             # Check admin role within tenant
└── isResourceOwner(resource)           # Validate resource ownership

Collection Rules:
├── /users/{userId}                     # Self-access only
├── /tenants/{tenantId}                 # Tenant member read, admin write
├── /tenants/{tenantId}/calendars/      # Member read, admin write
├── /tenants/{tenantId}/reservations/   # Member read, owner/admin write
├── /tenants/{tenantId}/resources/      # Member read, admin write
├── /tenants/{tenantId}/settings/       # Member read, admin write
├── /tenants/{tenantId}/analytics/      # Member read, admin write
└── Legacy collections (deprecated)     # Backward compatibility
```

---

## 📋 Development Guidelines

### **🚨 IMPORTANT: Architecture Update Policy**

> **⚠️ CRITICAL NOTICE**: When making changes to the project architecture, file structure, or adding new services, **YOU MUST UPDATE THIS DOCUMENTATION FILE** (`PROJECT_ARCHITECTURE.md`) to reflect the changes.

### **Code Organization**
1. **Functions Structure**:
   - `models/` - TypeScript interfaces and data models
   - `services/` - Business logic and data operations

2. **Available Functions**:
   - `helloWorld` - Health check endpoint (HTTP Request)
   - `createTenant` - Create new tenant organization (HTTP Request)
   - `getTenant` - Retrieve tenant information (HTTP Request)
   - `createCalendar` - Create bookable calendar/resource (HTTP Request)
   - `createReservation` - Create new reservation with dynamic validation (HTTPS Callable)

3. **Naming Conventions**:
   - Files: `kebab-case.ts`
   - Functions: `camelCase`
   - Constants: `UPPER_SNAKE_CASE`
   - Interfaces: `PascalCase` with `I` prefix

3. **TypeScript Standards**:
   - Strict type checking enabled
   - Explicit return types for functions
   - Interface-first development

### **Development Workflow**
1. Make code changes
2. Update this architecture file if structure changes
3. Test locally with Firebase emulators (`firebase emulators:start`)
4. Deploy to staging environment (if configured)
5. Test integration
6. Deploy to production (`firebase deploy`)

---

## 🚀 Deployment Instructions

### **Local Development**
```bash
# Install dependencies
cd functions && npm install

# Start Firebase emulators
firebase emulators:start

# Deploy functions only
firebase deploy --only functions

# Deploy all services
firebase deploy
```

### **Environment Management**
- **Development**: Use Firebase emulators
- **Staging**: Deploy to staging project (to be created)
- **Production**: Deploy to `gastby-navarenas`

---

## 📊 Firestore Collections & Document Structures

### **Current Implementation (Flat Structure)**

The project currently uses a flat collection structure with tenant isolation enforced through `tenantId` fields and Firestore security rules.

#### **Tenants Collection: `/tenants/{tenantId}`**
```typescript
{
  name: string;                    // Display name of the tenant organization
  domain: string;                  // Domain for tenant identification
  schemaConfig: {
    reservationTypes: Record<string, ReservationTypeSchema>; // Dynamic reservation types
    reservationFields?: string[];  // Legacy fields for backward compatibility
    requiresApproval?: boolean;     // Legacy approval setting
  };
  status: "active" | "suspended" | "pending";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings?: {                     // Optional tenant-specific settings
    timeZone: string;
    businessHours: { start: string; end: string; };
    maxAdvanceBooking: number;
  };
}
```

#### **Calendars Collection: `/calendars/{calendarId}`**
```typescript
{
  tenantId: string;                // Foreign key to tenants collection
  name: string;                    // Calendar display name
  description?: string;            // Optional calendar description
  reservationTypeKey?: string;     // Default reservation type for this calendar
  availability: {
    [weekday: string]: {           // "monday", "tuesday", etc.
      start: string;               // Start time "09:00"
      end: string;                 // End time "17:00"
      breaks?: Array<{start: string; end: string; name: string;}>;
    };
  };
  slotDuration: number;            // Booking slot duration in minutes
  bufferTime?: number;             // Buffer time between bookings
  maxConcurrentBookings: number;   // Maximum simultaneous bookings
  isActive: boolean;               // Whether calendar accepts new bookings
  createdAt: Timestamp;
  updatedAt: Timestamp;
  bookingRules?: {                 // Optional booking constraints
    minAdvanceNotice: number;
    maxBookingDuration: number;
    allowWeekends: boolean;
  };
}
```

#### **Reservations Collection: `/reservations/{reservationId}`**
```typescript
{
  tenantId: string;                // Foreign key to tenants collection
  calendarId: string;              // Foreign key to calendars collection
  reservationTypeKey: string;      // Key identifying the reservation type schema
  start: Timestamp;                // Reservation start time
  end: Timestamp;                  // Reservation end time
  userId: string;                  // ID of user who made the reservation
  // Dynamic details based on tenant's schemaConfig.reservationTypes[reservationTypeKey].fields
  details: Record<string, string | number | boolean>;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no-show";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  approvedBy?: string;             // User ID who approved (if requiresApproval is true)
  approvedAt?: Timestamp;          // When reservation was approved
  cancellationReason?: string;     // Reason for cancellation
  notes?: string;                  // Additional notes from staff
  metadata?: {                     // System metadata
    source: "web" | "api" | "admin";
    ipAddress?: string;
    userAgent?: string;
  };
}
```

#### **Users Collection: `/users/{userId}`**
```typescript
{
  email: string;                   // User's email address
  displayName: string;             // User's display name
  tenantId: string;                // Associated tenant
  role: "admin" | "staff" | "user"; // User role within tenant
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
  isActive: boolean;
  preferences?: {
    timezone: string;
    notifications: {email: boolean; sms: boolean;};
  };
}
```

### **Dynamic Schema System**

The project implements a sophisticated dynamic schema system for flexible reservation types:

#### **Schema Field Definition**
```typescript
{
  name: string;                    // Field name
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;               // Whether field is required
  options?: string[];              // Allowed values for the field
  min?: number;                    // Minimum value (for numbers)
  max?: number;                    // Maximum value (for numbers)
  label?: string;                  // Display label for the field
  placeholder?: string;            // Placeholder text for UI
}
```

#### **Reservation Type Schema**
```typescript
{
  fields: SchemaFieldDefinition[]; // Dynamic field definitions
  requiresApproval: boolean;       // Whether this reservation type needs approval
  name?: string;                   // Display name for this reservation type
  description?: string;            // Description of this reservation type
}
```

### **Security Model Notes**

- **Tenant Isolation**: All collections use flat structure with `tenantId` field-based filtering
- **Firestore Rules**: Support both current flat structure and planned hierarchical structure
- **Custom Claims**: Users have `tenantId` and `roles` (array) in their JWT tokens
- **Access Control**: Enforced through Firestore security rules based on custom claims

---

## 🌐 Frontend Application (Static Website)

The project includes a basic static frontend application located in the `public/` directory.

### Current Implementation
- **HTML5** structure with Google Sign-In integration
- **CSS3** basic styling
- **JavaScript (ES6+)** using Firebase v9 SDK for authentication
- **Google Sign-In** authentication flow with custom claims display

### Key Features
- User authentication with Google OAuth
- Display of custom JWT claims (`tenantId` and `roles`)
- Example API calls to Cloud Functions
- Firebase configuration placeholder for easy setup

### Configuration Required
The frontend requires Firebase configuration values to be updated in `public/app.js`:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // TODO: Replace
  authDomain: "gastby-navarenas.firebaseapp.com",
  projectId: "gastby-navarenas",
  storageBucket: "gastby-navarenas.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // TODO: Replace
  appId: "YOUR_APP_ID"                 // TODO: Replace
};
```

### Hosting
- **Firebase Hosting** configured in `firebase.json`
- Local testing: `firebase emulators:start` → `http://127.0.0.1:5000`
- Production deployment: `firebase deploy --only hosting`
- Production URL: `https://gastby-navarenas.web.app` (after deployment)

---

## 📝 Change Log

| Date | Change | Updated By |
|------|--------|------------|
| 2025-06-06 | Updated documentation to reflect actual codebase implementation | GitHub Copilot |
| 2025-06-06 | Corrected data structure from hierarchical to flat collections | GitHub Copilot |
| 2025-06-06 | Updated available functions list to match current implementation | GitHub Copilot |
| 2025-06-06 | Fixed schema system documentation with accurate TypeScript interfaces | GitHub Copilot |
| Previous | Various development and feature additions | System |

---

**Last Updated**: June 6, 2025
**Current Version**: 1.0.0 (Flat collection structure with dynamic schemas)
**Maintainer**: Project Team

> 📌 **Remember**: Keep this documentation updated when making architectural changes!
