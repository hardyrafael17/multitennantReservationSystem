# Multi-Tenant Reservation System

A Firebase-powered reservation management system designed for multiple tenants (organizations) to manage their bookings independently with strict data isolation and role-based access control.

## 📋 Development Guidelines

**For developers and AI assistants**: Please review the [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) for:
- Code style standards (ESLint/TypeScript rules)
- Import/export patterns
- Firebase Functions best practices
- Type safety guidelines
- Error handling patterns

**Key Rules**: Use double quotes, no spaces in braces for simple objects, max 120 chars per line, avoid `any` type, use proper TypeScript patterns.

## 🚀 Quick Start

### Prerequisites
- Node.js (v22 or higher)
- Firebase CLI installed globally
- Firebase account with billing enabled

### Setup
```bash
# Clone and navigate to project
cd multitennantReservationSystem

# Install dependencies
cd functions && npm install

# Login to Firebase (if not already logged in)
firebase login

# Start development environment
firebase emulators:start
```

### Running the Frontend
The frontend can be tested locally with Firebase emulators. After running `firebase emulators:start`, the application is typically available at `http://127.0.0.1:5000` (check emulator logs for the exact port).

## 📖 Documentation

For detailed project architecture, security model, and development guidelines, see:
**[PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)**

For code style standards, TypeScript patterns, and development best practices, see:
**[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)**

## 🛠️ Development Commands

```bash
# Start Firebase emulators (Firestore + Functions + Hosting)
firebase emulators:start

# Deploy functions only
firebase deploy --only functions

# Deploy hosting only
firebase deploy --only hosting

# Deploy Firestore rules only
firebase deploy --only firestore:rules

# Deploy everything
firebase deploy

# View logs
firebase functions:log

# Serve hosting locally (alternative to emulators)
firebase serve --only hosting
```

## 🏗️ Project Structure

```
multitennantReservationSystem/
├── PROJECT_ARCHITECTURE.md    # 📖 Detailed architecture documentation
├── DEVELOPMENT_GUIDE.md       # 🛠️ Code style and development standards
├── public/                    # 🌐 Static frontend (HTML, CSS, JS)
│   ├── index.html            # Main HTML page
│   ├── app.js                # Frontend JavaScript logic
│   └── style.css             # Basic styling
├── functions/                 # ☁️ Cloud Functions (TypeScript)
│   ├── src/
│   │   ├── index.ts          # Main functions entry point
│   │   ├── models/           # 📊 Data models and interfaces
│   │   └── services/         # 🔧 Business logic services
│   ├── package.json          # Node.js dependencies
│   └── tsconfig.json         # TypeScript configuration
├── firestore.rules           # 🔒 Multi-tenant security rules
├── firestore.indexes.json    # 📊 Database indexes
├── firebase.json             # ⚙️ Firebase configuration
├── .firebaserc              # 🎯 Firebase project aliases
└── README.md                # 📄 This file
```

## 🔧 Firebase Project

- **Project ID**: `gastby-navarenas`
- **Console**: [Firebase Console](https://console.firebase.google.com/project/gastby-navarenas)

## 🔗 Available API Endpoints

When running locally with Firebase emulators (`firebase emulators:start`):

### HTTP Functions
- `GET /helloWorld` - Health check endpoint
- `POST /createTenant` - Create new tenant organization
- `GET /getTenant?tenantId=ID` - Get tenant information
- `POST /createCalendar` - Create bookable calendar/resource

### HTTPS Callable Functions
- `createReservation` - Create new reservation with dynamic validation and schema support

**Base URL (Local)**: `http://127.0.0.1:5001/gastby-navarenas/us-central1/`
**Base URL (Production)**: `https://us-central1-gastby-navarenas.cloudfunctions.net/`

**Access Pattern**: All endpoints enforce tenant isolation through custom JWT claims (`tenantId` and `roles`).

## 📋 Key Features (Current Implementation)

- 🏢 **Multi-tenant architecture** with strict data isolation using flat collections
- 🔒 **Enhanced security model** with array-based roles (`admin`, `staff`, `user`)
- 📊 **Flat data structure** using `tenantId` field-based filtering
- 📅 **Calendar/resource management** with tenant-specific access
- 🗃️ **Firestore database** with comprehensive security rules
- 🎯 **Tenant-scoped data access** through custom JWT claims
- 💼 **TypeScript interfaces** and service layer
- ⚡ **Dynamic reservation validation** with sophisticated schema support
- 🌐 **Static frontend** with Google Sign-In authentication

### Current Data Structure
```
├── /tenants/{tenantId}                          # Tenant organizations
├── /calendars/{calendarId}                      # Calendars with tenantId field
├── /reservations/{reservationId}                # Reservations with tenantId field
└── /users/{userId}                              # User profiles with tenantId field

Note: Uses flat collection structure with tenantId-based filtering
and Firestore security rules for tenant isolation.
```

## 📋 Key Features (Planned)

- 👤 **User authentication** with Google Sign-In and custom claims
- 🌐 **Basic static frontend application** (in `public/`) with Google Sign-In
- 📊 **Analytics dashboard** for tenant insights
- 🔔 **Notification system** for reservation updates
- 🏪 **Firebase Hosting** configured and ready (serves `public/` directory)
- 📱 **Mobile-responsive design**
- 🔄 **Real-time updates** using Firestore listeners
- 📈 **Advanced reporting** and usage metrics

## 🔒 Security Model

### **Authentication & Authorization**
- **Custom JWT Claims**: Users have `tenantId` and `roles` array in their tokens
- **Tenant Isolation**: Strict data separation between organizations
- **Role-Based Access**: Granular permissions within tenant scope
- **Array-Based Roles**: Supports multiple roles per user (`admin`, `staff`, `user`)

### **Firestore Security Rules**
- ✅ **Tenant membership validation** for all data access
- ✅ **Resource ownership checks** for user-created content
- ✅ **Admin-only operations** for sensitive tenant management
- ✅ **Self-service capabilities** for user profiles and reservations
- ✅ **Backward compatibility** during migration period

**Example Custom Claims Structure:**
```json
{
  "tenantId": "acme-corp",
  "roles": ["admin", "staff"]
}
```

## 🤝 Contributing

1. **Read the documentation**: Review [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) and [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
2. **Follow code standards**: Use TypeScript best practices and ESLint rules
3. **Respect security model**: Ensure all changes maintain tenant isolation
4. **Update documentation**: **Always update PROJECT_ARCHITECTURE.md** if you modify project structure
5. **Test thoroughly**: Use Firebase emulators for local testing
6. **Validate security rules**: Run `firebase emulators:start` to test rule changes
7. **Submit pull request**: Include detailed description of changes

### **Development Checklist**
- [ ] Code follows TypeScript/ESLint standards
- [ ] Security rules updated if data structure changes
- [ ] Documentation updated for architectural changes
- [ ] Tests pass with Firebase emulators
- [ ] Custom claims and tenant isolation maintained

## 📞 Support

For questions about the project:

- **Architecture & Structure**: See [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)
- **Code Standards**: See [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
- **Security Model**: Review the Security Model section above
- **Firebase Console**: [gastby-navarenas project](https://console.firebase.google.com/project/gastby-navarenas)

### **Quick Reference**
- **Current Version**: 1.0.0 (Flat collection structure with dynamic schemas)
- **Last Updated**: June 6, 2025
- **Node.js**: v22+ required
- **Firebase CLI**: Latest version recommended

---

**⚠️ Important**: This project uses a flat multi-tenant structure with tenantId-based filtering. Always update `PROJECT_ARCHITECTURE.md` when making structural changes to ensure documentation stays current!
