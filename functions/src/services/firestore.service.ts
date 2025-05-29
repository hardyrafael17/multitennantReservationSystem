import {getFirestore, FieldValue, Timestamp} from "firebase-admin/firestore";
import {
  TenantDocument,
  CalendarDocument,
  ReservationDocument,
  UserDocument,
  COLLECTIONS,
  CreateTenantRequest,
  CreateCalendarRequest,
  CreateReservationRequest,
  ReservationTypeSchema,
} from "../models/firestore-types";

/**
 * Firestore Database Service
 * Provides centralized access to Firestore operations with type safety
 */
export class FirestoreService {
  private _db: FirebaseFirestore.Firestore | null = null;

  /**
   * Lazy initialization of Firestore instance
   * This ensures Firebase Admin is initialized before accessing Firestore
   */
  private get db(): FirebaseFirestore.Firestore {
    if (!this._db) {
      this._db = getFirestore();
    }
    return this._db;
  }

  /**
   * Tenant Operations
   */
  async createTenant(tenantId: string, data: CreateTenantRequest): Promise<void> {
    const tenantDoc: TenantDocument = {
      ...data,
      status: "active",
      createdAt: FieldValue.serverTimestamp() as Timestamp,
      updatedAt: FieldValue.serverTimestamp() as Timestamp,
    };

    await this.db.collection(COLLECTIONS.TENANTS).doc(tenantId).set(tenantDoc);
  }

  async getTenant(tenantId: string): Promise<TenantDocument | null> {
    const doc = await this.db.collection(COLLECTIONS.TENANTS).doc(tenantId).get();
    return doc.exists ? doc.data() as TenantDocument : null;
  }

  async updateTenant(tenantId: string, updates: Partial<TenantDocument>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await this.db.collection(COLLECTIONS.TENANTS).doc(tenantId).update(updateData);
  }

  /**
   * Calendar Operations
   */
  async createCalendar(calendarId: string, data: CreateCalendarRequest): Promise<void> {
    const calendarDoc: CalendarDocument = {
      ...data,
      isActive: true,
      createdAt: FieldValue.serverTimestamp() as Timestamp,
      updatedAt: FieldValue.serverTimestamp() as Timestamp,
    };

    await this.db.collection(COLLECTIONS.CALENDARS).doc(calendarId).set(calendarDoc);
  }

  async getCalendar(calendarId: string): Promise<CalendarDocument | null> {
    const doc = await this.db.collection(COLLECTIONS.CALENDARS).doc(calendarId).get();
    return doc.exists ? doc.data() as CalendarDocument : null;
  }

  async getCalendarsByTenant(tenantId: string, activeOnly = true): Promise<Array<CalendarDocument & { id: string }>> {
    let query = this.db.collection(COLLECTIONS.CALENDARS).where("tenantId", "==", tenantId);

    if (activeOnly) {
      query = query.where("isActive", "==", true);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data() as CalendarDocument}));
  }

  /**
   * Reservation Operations
   */
  async createReservation(reservationId: string, data: CreateReservationRequest): Promise<void> {
    const reservationDoc: ReservationDocument = {
      tenantId: data.tenantId,
      calendarId: data.calendarId,
      reservationTypeKey: "", // Will be set by the calling function
      start: typeof data.start === "string" ? Timestamp.fromDate(new Date(data.start)) : data.start,
      end: typeof data.end === "string" ? Timestamp.fromDate(new Date(data.end)) : data.end,
      userId: "", // Will be set by the calling function with authenticated user ID
      details: data.details,
      status: "pending",
      createdAt: FieldValue.serverTimestamp() as Timestamp,
      updatedAt: FieldValue.serverTimestamp() as Timestamp,
      metadata: data.metadata,
    };

    await this.db.collection(COLLECTIONS.RESERVATIONS).doc(reservationId).set(reservationDoc);
  }

  async getReservation(reservationId: string): Promise<ReservationDocument | null> {
    const doc = await this.db.collection(COLLECTIONS.RESERVATIONS).doc(reservationId).get();
    return doc.exists ? doc.data() as ReservationDocument : null;
  }

  async getReservationsByTenant(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
    status?: ReservationDocument["status"]
  ): Promise<Array<ReservationDocument & { id: string }>> {
    let query = this.db.collection(COLLECTIONS.RESERVATIONS).where("tenantId", "==", tenantId);

    if (startDate) {
      query = query.where("start", ">=", Timestamp.fromDate(startDate));
    }

    if (endDate) {
      query = query.where("start", "<=", Timestamp.fromDate(endDate));
    }

    if (status) {
      query = query.where("status", "==", status);
    }

    query = query.orderBy("start", "asc");

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data() as ReservationDocument}));
  }

  async getReservationsByCalendar(
    calendarId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<ReservationDocument & { id: string }>> {
    const query = this.db.collection(COLLECTIONS.RESERVATIONS)
      .where("calendarId", "==", calendarId)
      .where("start", ">=", Timestamp.fromDate(startDate))
      .where("start", "<=", Timestamp.fromDate(endDate))
      .where("status", "in", ["pending", "confirmed"])
      .orderBy("start", "asc");

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data() as ReservationDocument}));
  }

  async updateReservationStatus(
    reservationId: string,
    status: ReservationDocument["status"],
    approvedBy?: string,
    notes?: string
  ): Promise<void> {
    const updateData: Partial<ReservationDocument> = {
      status,
      updatedAt: FieldValue.serverTimestamp() as Timestamp,
      notes,
    };

    if (status === "confirmed" && approvedBy) {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = FieldValue.serverTimestamp() as Timestamp;
    }

    await this.db.collection(COLLECTIONS.RESERVATIONS).doc(reservationId).update(updateData);
  }

  /**
   * User Operations
   */
  async createUser(userId: string, userData: Omit<UserDocument, "createdAt" | "isActive">): Promise<void> {
    const userDoc: UserDocument = {
      ...userData,
      isActive: true,
      createdAt: FieldValue.serverTimestamp() as Timestamp,
    };

    await this.db.collection(COLLECTIONS.USERS).doc(userId).set(userDoc);
  }

  async getUser(userId: string): Promise<UserDocument | null> {
    const doc = await this.db.collection(COLLECTIONS.USERS).doc(userId).get();
    return doc.exists ? doc.data() as UserDocument : null;
  }

  async getUsersByTenant(tenantId: string): Promise<Array<UserDocument & { id: string }>> {
    const query = this.db.collection(COLLECTIONS.USERS)
      .where("tenantId", "==", tenantId)
      .where("isActive", "==", true);

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data() as UserDocument}));
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    await this.db.collection(COLLECTIONS.USERS).doc(userId).update({
      lastLoginAt: FieldValue.serverTimestamp(),
    });
  }

  /**
   * Utility Operations
   */
  async checkAvailability(
    calendarId: string,
    startTime: Date,
    endTime: Date,
    excludeReservationId?: string
  ): Promise<boolean> {
    const query = this.db.collection(COLLECTIONS.RESERVATIONS)
      .where("calendarId", "==", calendarId)
      .where("status", "in", ["pending", "confirmed"]);

    // Check for overlapping reservations
    // A reservation overlaps if:
    // (start < endTime) AND (end > startTime)
    const snapshot = await query
      .where("start", "<", Timestamp.fromDate(endTime))
      .where("end", ">", Timestamp.fromDate(startTime))
      .get();

    // Filter out the excluded reservation if provided
    const conflictingReservations = snapshot.docs.filter((doc) =>
      excludeReservationId ? doc.id !== excludeReservationId : true
    );

    return conflictingReservations.length === 0;
  }

  /**
   * Get tenant's schema configuration for dynamic field validation
   */
  async getTenantSchema(tenantId: string): Promise<TenantDocument["schemaConfig"] | null> {
    const tenant = await this.getTenant(tenantId);
    return tenant?.schemaConfig || null;
  }

  /**
   * Validate reservation details against tenant schema (legacy method for backward compatibility)
   */
  validateReservationDetails(
    details: Record<string, string | number | boolean>,
    schemaConfig: TenantDocument["schemaConfig"]
  ): { isValid: boolean; missingFields: string[] } {
    // Support legacy schema format
    if (schemaConfig.reservationFields) {
      const missingFields = schemaConfig.reservationFields.filter((field) =>
        !Object.prototype.hasOwnProperty.call(details, field) ||
        details[field] === null ||
        details[field] === undefined ||
        details[field] === ""
      );

      return {
        isValid: missingFields.length === 0,
        missingFields,
      };
    }

    // If no legacy fields, assume validation is handled elsewhere
    return {
      isValid: true,
      missingFields: [],
    };
  }

  /**
   * Advanced schema validation for new reservation type schema
   */
  validateReservationDetailsAdvanced(
    details: Record<string, string | number | boolean>,
    schemaDefinition: ReservationTypeSchema
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const field of schemaDefinition.fields) {
      const value = details[field.name];
      const hasValue = value !== null && value !== undefined && value !== "";

      // Check required fields
      if (field.required && !hasValue) {
        errors.push(`Field '${field.name}' is required`);
        continue;
      }

      // Skip type checking if field is not provided and not required
      if (!hasValue) {
        continue;
      }

      // Type validation
      switch (field.type) {
      case "string":
        if (typeof value !== "string") {
          errors.push(`Field '${field.name}' must be a string`);
        }
        break;
      case "number":
        if (typeof value !== "number") {
          errors.push(`Field '${field.name}' must be a number`);
        } else {
          // Min/Max validation for numbers
          if (field.min !== undefined && value < field.min) {
            errors.push(`Field '${field.name}' must be at least ${field.min}`);
          }
          if (field.max !== undefined && value > field.max) {
            errors.push(`Field '${field.name}' must be at most ${field.max}`);
          }
        }
        break;
      case "boolean":
        if (typeof value !== "boolean") {
          errors.push(`Field '${field.name}' must be a boolean`);
        }
        break;
      case "array":
        if (!Array.isArray(value)) {
          errors.push(`Field '${field.name}' must be an array`);
        }
        break;
      }

      // Options validation
      if (field.options && field.options.length > 0) {
        if (field.type === "array" && Array.isArray(value)) {
          // For array types, check if all items are in options
          for (const item of value) {
            if (!field.options.includes(String(item))) {
              const allowedOptions = field.options.join(", ");
              errors.push(`Field '${field.name}' contains invalid option '${item}'. Allowed: ${allowedOptions}`);
            }
          }
        } else {
          // For single values, check if value is in options
          if (!field.options.includes(String(value))) {
            errors.push(`Field '${field.name}' must be one of: ${field.options.join(", ")}`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check for conflicting reservations within a time range
   */
  async checkReservationConflicts(
    tenantId: string,
    calendarId: string,
    startTime: Date,
    endTime: Date,
    excludeReservationId?: string
  ): Promise<Array<ReservationDocument & { id: string }>> {
    const query = this.db.collection(COLLECTIONS.RESERVATIONS)
      .where("tenantId", "==", tenantId)
      .where("calendarId", "==", calendarId)
      .where("status", "!=", "cancelled");

    // Check for overlapping reservations
    // A reservation overlaps if: (start < endTime) AND (end > startTime)
    const snapshot = await query
      .where("start", "<", Timestamp.fromDate(endTime))
      .where("end", ">", Timestamp.fromDate(startTime))
      .get();

    const conflictingReservations = snapshot.docs
      .filter((doc) => excludeReservationId ? doc.id !== excludeReservationId : true)
      .map((doc) => ({id: doc.id, ...doc.data() as ReservationDocument}));

    return conflictingReservations;
  }

  /**
   * Create reservation with full reservation data (used by createReservation callable)
   */
  async createReservationFull(
    reservationData: Omit<ReservationDocument, "createdAt" | "updatedAt">
  ): Promise<string> {
    const reservationDoc: ReservationDocument = {
      ...reservationData,
      createdAt: FieldValue.serverTimestamp() as Timestamp,
      updatedAt: FieldValue.serverTimestamp() as Timestamp,
    };

    const docRef = await this.db.collection(COLLECTIONS.RESERVATIONS).add(reservationDoc);
    return docRef.id;
  }
}

// Singleton instance
export const firestoreService = new FirestoreService();
