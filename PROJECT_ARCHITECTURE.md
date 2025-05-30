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
        ├── models/               # 📊 Data models and interfaces
        │   └── firestore-types.ts
        └── services/             # 🔧 Business logic services
            └── firestore.service.ts
```

---

## 🛠️ Technology Stack

### **Backend Services**
- **Firebase Cloud Functions** - Serverless backend API
- **Cloud Firestore** - NoSQL document database
- **Firebase Authentication** - User authentication & authorization
- **Firebase Hosting** - Static website hosting (future)

### **Languages & Frameworks**
- **TypeScript** - Primary development language
- **Node.js** - Runtime environment
- **ESLint** - Code linting and formatting

### **Development Tools**
- **Firebase CLI** - Project management and deployment
- **npm** - Package management

---

## 🏛️ Architecture Patterns

### **Multi-Tenancy Model**
- **Tenant Isolation**: Each tenant's data is logically separated
- **Shared Infrastructure**: All tenants use the same Firebase project
- **Row-Level Security**: Firestore rules enforce tenant boundaries

### **Data Architecture**
```
Firestore Database Structure:
├── tenants/{tenantId}                           # Tenant organizations
│   ├── calendars/{calendarId}                   # Tenant-specific calendars
│   ├── reservations/{reservationId}             # Tenant-specific reservations
│   ├── resources/{resourceId}                   # Tenant-specific resources
│   ├── settings/{settingId}                     # Tenant-specific settings
│   └── analytics/{analyticsId}                  # Tenant-specific analytics
├── users/{userId}                               # User profiles
├── calendars/{calendarId}                       # Legacy: Global calendars (deprecated)
└── reservations/{reservationId}                 # Legacy: Global reservations (deprecated)
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
- ✅ Firebase Authentication (to be configured)
- 🔲 Firebase Hosting (future)
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
3. Test locally with Firebase emulators
4. Deploy to staging environment
5. Test integration
6. Deploy to production

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

### **Core Collections**

#### **Users Collection: `/users/{userId}`**
```typescript
{
  uid: string;              // Firebase Auth UID
  email: string;            // User's email address
  displayName: string;      // User's display name
  tenantId: string;         // Assigned tenant ID
  roles: string[];          // Array of roles within tenant
  createdAt: timestamp;     // Account creation date
  updatedAt: timestamp;     // Last profile update
}
```

#### **Tenants Collection: `/tenants/{tenantId}`**
```typescript
{
  id: string;               // Tenant identifier
  name: string;             // Organization name
  displayName: string;      // Public display name
  settings: {               // Tenant-specific settings
    timezone: string;
    businessHours: object;
    features: string[];
  };
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### **Tenant Subcollections**

#### **Calendars: `/tenants/{tenantId}/calendars/{calendarId}`**
```typescript
{
  id: string;               // Calendar identifier
  tenantId: string;         // Parent tenant ID
  name: string;             // Calendar display name
  description: string;      // Calendar description
  type: string;             // Calendar type (room, equipment, etc.)
  capacity: number;         // Maximum capacity
  settings: {
    allowBookingWindow: number;     // Days in advance
    minimumDuration: number;        // Minimum booking duration
    maximumDuration: number;        // Maximum booking duration
  };
  active: boolean;          // Whether calendar is active
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

#### **Reservations: `/tenants/{tenantId}/reservations/{reservationId}`**
```typescript
{
  id: string;               // Reservation identifier
  tenantId: string;         // Parent tenant ID
  userId: string;           // User who made the reservation
  calendarId: string;       // Associated calendar
  title: string;            // Reservation title
  description: string;      // Reservation description
  startTime: timestamp;     // Start date/time
  endTime: timestamp;       // End date/time
  status: string;           // 'pending' | 'confirmed' | 'cancelled'
  attendees: number;        // Number of attendees
  metadata: object;         // Additional custom fields
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

#### **Resources: `/tenants/{tenantId}/resources/{resourceId}`**
```typescript
{
  id: string;               // Resource identifier
  tenantId: string;         // Parent tenant ID
  name: string;             // Resource name
  type: string;             // Resource type
  description: string;      // Resource description
  availability: object;     // Availability configuration
  active: boolean;          // Whether resource is active
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

#### **Settings: `/tenants/{tenantId}/settings/{settingId}`**
```typescript
{
  id: string;               // Setting identifier
  tenantId: string;         // Parent tenant ID
  category: string;         // Setting category
  key: string;              // Setting key
  value: any;               // Setting value
  type: string;             // Value type (string, number, boolean, object)
  updatedAt: timestamp;
  updatedBy: string;        // User ID who updated
}
```

#### **Analytics: `/tenants/{tenantId}/analytics/{analyticsId}`**
```typescript
{
  id: string;               // Analytics record identifier
  tenantId: string;         // Parent tenant ID
  eventType: string;        // Type of analytics event
  data: object;             // Analytics data payload
  timestamp: timestamp;     // When the event occurred
  userId?: string;          // Optional user associated with event
}
```

### **Legacy Collections (Deprecated)**

These collections maintain backward compatibility during migration:

- `/calendars/{calendarId}` - Legacy calendar documents
- `/reservations/{reservationId}` - Legacy reservation documents

**Migration Note**: New implementations should use the tenant-based subcollection structure for better isolation and scalability.

---

## 📝 Change Log

| Date | Change | Updated By |
|------|--------|------------|
| 2025-05-29 | Initial project setup with Firestore and Cloud Functions | System |
| 2025-05-29 | Added comprehensive Firestore collections and document structures | System |
| 2025-05-29 | Implemented TypeScript interfaces and service layer | System |
| 2025-05-29 | Enhanced security rules with role-based access control | System |
| 2025-05-29 | Added composite indexes for query optimization | System |
| 2025-05-29 | Updated documentation to match actual codebase and project ID | GitHub Copilot |
| 2025-05-29 | Implemented createReservation HTTPS Callable function with advanced schema validation | GitHub Copilot |
| 2025-05-29 | Enhanced type definitions to support dynamic reservation type schemas | GitHub Copilot |
| 2025-06-01 | Added advanced schema configuration documentation | System |
| 2025-06-01 | Updated createReservation function features | System |
| 2025-05-30 | **Major Update**: Restructured Firestore security rules for tenant-based subcollections | GitHub Copilot |
| 2025-05-30 | Updated authentication model from single role to array-based roles system | GitHub Copilot |
| 2025-05-30 | Implemented hierarchical data structure with tenant-specific subcollections | GitHub Copilot |
| 2025-05-30 | Added backward compatibility for legacy flat collection structure | GitHub Copilot |

---

**Last Updated**: May 30, 2025
**Version**: 2.0.0
**Maintainer**: Project Team

> 📌 **Remember**: Keep this documentation updated when making architectural changes!
