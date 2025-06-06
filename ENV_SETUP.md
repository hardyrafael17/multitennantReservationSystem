# Environment Configuration Setup

This project uses environment variables to securely manage Firebase configuration without committing sensitive data to version control.

## Setup Instructions

### 1. Configure Environment Variables

1. Copy the `.env` file in the root directory
2. Replace the placeholder values with your actual Firebase configuration:

```bash
# Firebase Configuration
FIREBASE_API_KEY=your_actual_api_key_here
FIREBASE_AUTH_DOMAIN=gastby-navarenas.firebaseapp.com
FIREBASE_PROJECT_ID=gastby-navarenas
FIREBASE_STORAGE_BUCKET=gastby-navarenas.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_actual_messaging_sender_id_here
FIREBASE_APP_ID=your_actual_app_id_here
```

### 2. Get Your Firebase Configuration

To get the actual values:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: "gastby-navarenas"
3. Click the gear icon ⚙️ next to "Project Overview"
4. Go to "General" tab → "Your apps" section
5. If you don't have a web app, click "Add app" and select web (`</>`)
6. Copy the config values from the Firebase SDK snippet

### 3. Generate Client Configuration

After updating your `.env` file, run:

```bash
node generate-config.js
```

This will create `public/config.js` from your environment variables.

### 4. Security Notes

- **`.env`** - Contains your actual secrets (git-ignored)
- **`public/config.js`** - Generated from .env (git-ignored)
- **`public/config.js.template`** - Template with placeholders (committed to git)
- **`generate-config.js`** - Script to generate config.js from .env

### 5. Development Workflow

1. Update `.env` with your actual Firebase values
2. Run `node generate-config.js` to generate the client config
3. Your app will now load the configuration securely
4. The sensitive data stays out of your git repository

### 6. Team Setup

When a new team member joins:
1. They copy `.env` and add their own Firebase values
2. They run `node generate-config.js`
3. They can start developing immediately

The configuration is automatically loaded by the `ConfigLoader` class in `public/config-loader.js`.
