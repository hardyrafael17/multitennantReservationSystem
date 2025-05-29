/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import * as logger from "firebase-functions/logger";
import { firestoreService } from "./services/firestore.service";

// Initialize Firebase Admin
initializeApp();

// Test endpoint to verify the system is working
export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.json({ 
    message: "Hello from Multi-Tenant Reservation System!",
    timestamp: new Date().toISOString(),
    environment: "emulator"
  });
});

// Create a tenant (for testing)
export const createTenant = onRequest(async (request, response) => {
  try {
    if (request.method !== 'POST') {
      response.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { name, domain, reservationFields = ["name", "email"], requiresApproval = false } = request.body;
    
    if (!name || !domain) {
      response.status(400).json({ error: 'Name and domain are required' });
      return;
    }

    const tenantId = `tenant_${Date.now()}`;
    
    await firestoreService.createTenant(tenantId, {
      name,
      domain,
      schemaConfig: {
        reservationFields,
        requiresApproval
      }
    });

    response.json({ 
      success: true, 
      tenantId,
      message: 'Tenant created successfully'
    });
  } catch (error) {
    logger.error('Error creating tenant:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

// Get tenant info
export const getTenant = onRequest(async (request, response) => {
  try {
    const tenantId = request.query.tenantId as string;
    
    if (!tenantId) {
      response.status(400).json({ error: 'tenantId query parameter is required' });
      return;
    }

    const tenant = await firestoreService.getTenant(tenantId);
    
    if (!tenant) {
      response.status(404).json({ error: 'Tenant not found' });
      return;
    }

    response.json({ tenant });
  } catch (error) {
    logger.error('Error getting tenant:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

// Create a calendar
export const createCalendar = onRequest(async (request, response) => {
  try {
    if (request.method !== 'POST') {
      response.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { tenantId, name, slotDuration = 30, maxConcurrentBookings = 1 } = request.body;
    
    if (!tenantId || !name) {
      response.status(400).json({ error: 'tenantId and name are required' });
      return;
    }

    const calendarId = `calendar_${Date.now()}`;
    
    await firestoreService.createCalendar(calendarId, {
      tenantId,
      name,
      availability: {
        monday: { start: "09:00", end: "17:00" },
        tuesday: { start: "09:00", end: "17:00" },
        wednesday: { start: "09:00", end: "17:00" },
        thursday: { start: "09:00", end: "17:00" },
        friday: { start: "09:00", end: "17:00" }
      },
      slotDuration,
      maxConcurrentBookings
    });

    response.json({ 
      success: true, 
      calendarId,
      message: 'Calendar created successfully'
    });
  } catch (error) {
    logger.error('Error creating calendar:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});