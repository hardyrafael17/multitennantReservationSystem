# Multi-Tenant Reservation System

A Firebase-powered reservation management system designed for multiple tenants (organizations) to manage their bookings independently.

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
- Node.js (v20 or higher)
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

## 📖 Documentation

For detailed project architecture, security model, and development guidelines, see:
**[PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)**

## 🛠️ Development Commands

```bash
# Start Firebase emulators (Firestore + Functions)
firebase emulators:start

# Deploy functions only
firebase deploy --only functions

# Deploy Firestore rules only
firebase deploy --only firestore:rules

# Deploy everything
firebase deploy

# View logs
firebase functions:log
```

## 🏗️ Project Structure

```
├── PROJECT_ARCHITECTURE.md    # 📖 Detailed architecture documentation
├── functions/                 # ☁️ Cloud Functions (TypeScript)
├── firestore.rules           # 🔒 Database security rules
├── firebase.json             # ⚙️ Firebase configuration
└── README.md                 # 📄 This file
```

## 🔧 Firebase Project

- **Project ID**: `multitenantreservationsystem`
- **Console**: [Firebase Console](https://console.firebase.google.com/project/multitenantreservationsystem)

## 📋 Key Features (Planned)

- 🏢 Multi-tenant architecture
- 📅 Reservation management
- 👤 User authentication
- 🔒 Tenant-isolated data
- 📊 Analytics dashboard
- 🔔 Notifications

## 🤝 Contributing

1. Read the [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) file
2. Make your changes
3. **Update PROJECT_ARCHITECTURE.md if you modify the project structure**
4. Test with Firebase emulators
5. Submit a pull request

## 📞 Support

For questions about the project architecture or development guidelines, refer to the comprehensive documentation in `PROJECT_ARCHITECTURE.md`.

---

**⚠️ Important**: Always update `PROJECT_ARCHITECTURE.md` when making structural changes to ensure documentation stays current!
