#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load .env file
const envPath = path.join(__dirname, '.env');
const configTemplatePath = path.join(__dirname, 'public', 'config.js.template');
const configPath = path.join(__dirname, 'public', 'config.js');

function loadEnvFile(filePath) {
    const env = {};
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const [key, ...valueParts] = trimmedLine.split('=');
                if (key && valueParts.length > 0) {
                    env[key.trim()] = valueParts.join('=').trim();
                }
            }
        }
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
    }
    return env;
}

function generateConfigFile() {
    console.log('🔧 Generating config.js from .env file...');

    // Load environment variables
    const env = loadEnvFile(envPath);

    if (Object.keys(env).length === 0) {
        console.error('❌ No environment variables found in .env file');
        process.exit(1);
    }

    // Create config file content
    const configContent = `// Configuration file - DO NOT COMMIT THIS FILE TO GIT
// Auto-generated from .env file
// This file should be in your .gitignore

export default {
    FIREBASE_API_KEY: '${env.FIREBASE_API_KEY || 'your_actual_api_key_here'}',
    FIREBASE_AUTH_DOMAIN: '${env.FIREBASE_AUTH_DOMAIN || 'gastby-navarenas.firebaseapp.com'}',
    FIREBASE_PROJECT_ID: '${env.FIREBASE_PROJECT_ID || 'gastby-navarenas'}',
    FIREBASE_STORAGE_BUCKET: '${env.FIREBASE_STORAGE_BUCKET || 'gastby-navarenas.appspot.com'}',
    FIREBASE_MESSAGING_SENDER_ID: '${env.FIREBASE_MESSAGING_SENDER_ID || 'your_actual_messaging_sender_id_here'}',
    FIREBASE_APP_ID: '${env.FIREBASE_APP_ID || 'your_actual_app_id_here'}'
};`;

    // Write config file
    try {
        fs.writeFileSync(configPath, configContent, 'utf8');
        console.log('✅ config.js generated successfully!');
        console.log(`📁 Location: ${configPath}`);

        // Check if any values are still placeholders
        const hasPlaceholders = Object.values(env).some(value =>
            value.includes('your_actual_') || value === ''
        );

        if (hasPlaceholders) {
            console.log('⚠️  Warning: Some values in .env are still placeholders. Please update them with actual Firebase config values.');
        }

    } catch (error) {
        console.error('❌ Error writing config.js:', error.message);
        process.exit(1);
    }
}

// Run the generator
generateConfigFile();
