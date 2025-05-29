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
├── tenants/{tenantId}             # Tenant organizations
├── calendars/{calendarId}         # Bookable resources/calendars
├── reservations/{reservationId}   # Reservation records
└── users/{userId}                 # User profiles
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
- **Custom Claims**: Users have `tenantId` and `role` in their JWT token
- **Tenant Assignment**: Users are assigned to tenants during registration
- **Role Management**: Three roles supported - `admin`, `staff`, `user`

### **Firestore Security Rules Implementation**
The security rules enforce strict tenant isolation and role-based access control. Key features:

- **Tenant Isolation**: Users can only access data for their assigned tenant
- **Role-Based Access**: Different permissions for admin, staff, and regular users
- **Resource Protection**: Calendars and reservations have appropriate read/write restrictions
- **Self-Service**: Users can manage their own profiles and reservations with limitations

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

## 📚 Additional Documentation

### **Related Files**
- `README.md` - Setup and usage instructions
- `DEVELOPMENT_GUIDE.md` - Code style standards and development patterns
- `functions/package.json` - Dependencies and scripts
- `firestore.rules` - Detailed security rules
- `firestore.indexes.json` - Database query indexes
- `functions/src/models/firestore-types.ts` - TypeScript interfaces
- `functions/src/services/firestore.service.ts` - Database service layer

### **External Resources**
- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

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

---

**Last Updated**: June 1, 2025
**Version**: 1.3.0
**Maintainer**: Project Team

> 📌 **Remember**: Keep this documentation updated when making architectural changes!
