// Environment configuration loader for client-side JavaScript
// This file loads configuration from a config.js file that should be created from the .env template

class ConfigLoader {
    constructor() {
        this.config = {};
        this.loaded = false;
    }

    async loadConfig() {
        if (this.loaded) return this.config;

        try {
            // Try to load from a dynamically imported config file
            const configModule = await import('./config.js');
            this.config = configModule.default || configModule;
            this.loaded = true;
            return this.config;
        } catch (error) {
            console.warn('Config file not found. Using fallback configuration.');
            // Fallback configuration - these should be replaced with actual values
            this.config = {
                FIREBASE_API_KEY: 'your_actual_api_key_here',
                FIREBASE_AUTH_DOMAIN: 'gastby-navarenas.firebaseapp.com',
                FIREBASE_PROJECT_ID: 'gastby-navarenas',
                FIREBASE_STORAGE_BUCKET: 'gastby-navarenas.appspot.com',
                FIREBASE_MESSAGING_SENDER_ID: 'your_actual_messaging_sender_id_here',
                FIREBASE_APP_ID: 'your_actual_app_id_here'
            };
            this.loaded = true;
            return this.config;
        }
    }

    getFirebaseConfig() {
        if (!this.loaded) {
            throw new Error('Config not loaded. Call loadConfig() first.');
        }

        return {
            apiKey: this.config.FIREBASE_API_KEY,
            authDomain: this.config.FIREBASE_AUTH_DOMAIN,
            projectId: this.config.FIREBASE_PROJECT_ID,
            storageBucket: this.config.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: this.config.FIREBASE_MESSAGING_SENDER_ID,
            appId: this.config.FIREBASE_APP_ID
        };
    }
}

// Export as default
window.ConfigLoader = ConfigLoader;
