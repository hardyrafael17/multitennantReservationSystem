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

import {onRequest, onCall, HttpsError} from "firebase-functions/v2/https";
import {initializeApp} from "firebase-admin/app";
import {Timestamp} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {firestoreService} from "./services/firestore.service";
import {CreateReservationCallableRequest} from "./models/firestore-types";

// Initialize Firebase Admin
initializeApp();

// Test endpoint to verify the system is working
export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.json({
    message: "Hello from Multi-Tenant Reservation System!",
    timestamp: new Date().toISOString(),
    environment: "emulator",
  });
});

// Create a tenant (for testing)
export const createTenant = onRequest(async (request, response) => {
  try {
    if (request.method !== "POST") {
      response.status(405).json({error: "Method not allowed"});
      return;
    }

    const {
      name,
      domain,
      reservationFields = ["name", "email"],
      requiresApproval = false,
    } = request.body;

    if (!name || !domain) {
      response.status(400).json({error: "Name and domain are required"});
      return;
    }

    const tenantId = `tenant_${Date.now()}`;

    await firestoreService.createTenant(tenantId, {
      name,
      domain,
      schemaConfig: {
        reservationTypes: {},
        reservationFields,
        requiresApproval,
      },
    });

    response.json({
      success: true,
      tenantId,
      message: "Tenant created successfully",
    });
  } catch (error) {
    logger.error("Error creating tenant:", error);
    response.status(500).json({error: "Internal server error"});
  }
});

// Get tenant info
export const getTenant = onRequest(async (request, response) => {
  try {
    const tenantId = request.query.tenantId as string;

    if (!tenantId) {
      response.status(400).json({
        error: "tenantId query parameter is required",
      });
      return;
    }

    const tenant = await firestoreService.getTenant(tenantId);

    if (!tenant) {
      response.status(404).json({error: "Tenant not found"});
      return;
    }

    response.json({tenant});
  } catch (error) {
    logger.error("Error getting tenant:", error);
    response.status(500).json({error: "Internal server error"});
  }
});

// Create a calendar
export const createCalendar = onRequest(async (request, response) => {
  try {
    if (request.method !== "POST") {
      response.status(405).json({error: "Method not allowed"});
      return;
    }

    const {
      tenantId,
      name,
      slotDuration = 30,
      maxConcurrentBookings = 1,
    } = request.body;

    if (!tenantId || !name) {
      response.status(400).json({
        error: "tenantId and name are required",
      });
      return;
    }

    const calendarId = `calendar_${Date.now()}`;

    await firestoreService.createCalendar(calendarId, {
      tenantId,
      name,
      availability: {
        monday: {start: "09:00", end: "17:00"},
        tuesday: {start: "09:00", end: "17:00"},
        wednesday: {start: "09:00", end: "17:00"},
        thursday: {start: "09:00", end: "17:00"},
        friday: {start: "09:00", end: "17:00"},
      },
      slotDuration,
      maxConcurrentBookings,
    });

    response.json({
      success: true,
      calendarId,
      message: "Calendar created successfully",
    });
  } catch (error) {
    logger.error("Error creating calendar:", error);
    response.status(500).json({error: "Internal server error"});
  }
});

// Create a reservation (HTTPS Callable Function)
export const createReservation = onCall(async (request) => {
  try {
    // 1. Authentication & Authorization
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const data = request.data as CreateReservationCallableRequest;
    const userId = request.auth.uid;

    // If custom claims are present, validate tenant access
    if (request.auth.token?.tenantId && request.auth.token.tenantId !== data.tenantId) {
      throw new HttpsError("permission-denied", "User does not have access to this tenant");
    }

    // 2. Input Validation (Basic)
    if (!data.tenantId || typeof data.tenantId !== "string") {
      throw new HttpsError("invalid-argument", "tenantId is required and must be a string");
    }
    if (!data.calendarId || typeof data.calendarId !== "string") {
      throw new HttpsError("invalid-argument", "calendarId is required and must be a string");
    }
    if (!data.start || typeof data.start !== "string") {
      throw new HttpsError("invalid-argument", "start is required and must be an ISO 8601 string");
    }
    if (!data.end || typeof data.end !== "string") {
      throw new HttpsError("invalid-argument", "end is required and must be an ISO 8601 string");
    }
    if (!data.details || typeof data.details !== "object") {
      throw new HttpsError("invalid-argument", "details is required and must be an object");
    }

    // Parse and validate dates
    const startDate = new Date(data.start);
    const endDate = new Date(data.end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new HttpsError("invalid-argument", "Invalid date format. Use ISO 8601 format.");
    }

    if (endDate <= startDate) {
      throw new HttpsError("invalid-argument", "End time must be after start time");
    }

    // 3. Fetch Tenant and Calendar Information
    const [tenant, calendar] = await Promise.all([
      firestoreService.getTenant(data.tenantId),
      firestoreService.getCalendar(data.calendarId),
    ]);

    if (!tenant) {
      throw new HttpsError("not-found", "Tenant not found");
    }

    if (!calendar) {
      throw new HttpsError("not-found", "Calendar not found");
    }

    if (calendar.tenantId !== data.tenantId) {
      throw new HttpsError("permission-denied", "Calendar does not belong to the specified tenant");
    }

    // 4. Determine Reservation Type Key
    const currentReservationTypeKey = data.reservationTypeKey || calendar.reservationTypeKey;

    if (!currentReservationTypeKey) {
      throw new HttpsError("invalid-argument", "Reservation type key is missing");
    }

    const schemaDefinition = tenant.schemaConfig.reservationTypes[currentReservationTypeKey];

    if (!schemaDefinition) {
      throw new HttpsError("invalid-argument", "Invalid reservation type key");
    }

    // 5. Schema Validation (Dynamic against schemaDefinition.fields)
    const validationResult = firestoreService.validateReservationDetailsAdvanced(
      data.details,
      schemaDefinition
    );

    if (!validationResult.isValid) {
      throw new HttpsError("invalid-argument", `Validation errors: ${validationResult.errors.join(", ")}`);
    }

    // 6. Conflict Checking
    const conflictingReservations = await firestoreService.checkReservationConflicts(
      data.tenantId,
      data.calendarId,
      startDate,
      endDate
    );

    if (conflictingReservations.length > 0) {
      throw new HttpsError("failed-precondition", "Time slot not available");
    }

    // 7. Create Reservation Document
    const reservationData = {
      tenantId: data.tenantId,
      calendarId: data.calendarId,
      reservationTypeKey: currentReservationTypeKey,
      start: Timestamp.fromDate(startDate),
      end: Timestamp.fromDate(endDate),
      userId: userId,
      details: data.details,
      status: (schemaDefinition.requiresApproval ? "pending" : "confirmed") as "pending" | "confirmed",
      approvedBy: undefined,
      approvedAt: undefined,
      cancellationReason: undefined,
      notes: undefined,
      metadata: {
        source: "api" as const,
        ipAddress: request.rawRequest?.ip,
        userAgent: request.rawRequest?.get("user-agent"),
      },
    };

    const reservationId = await firestoreService.createReservationFull(reservationData);

    // 8. Return Response
    return {
      success: true,
      reservationId,
    };
  } catch (error) {
    // 9. Error Handling
    logger.error("Error in createReservation:", error);

    // Re-throw HttpsError instances
    if (error instanceof HttpsError) {
      throw error;
    }

    // Handle unexpected errors
    throw new HttpsError("internal", "An unexpected error occurred");
  }
});
