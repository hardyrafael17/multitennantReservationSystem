import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { 
  TenantDocument, 
  CalendarDocument, 
  ReservationDocument, 
  UserDocument,
  COLLECTIONS,
  CreateTenantRequest,
  CreateCalendarRequest,
  CreateReservationRequest
} from '../models/firestore-types';

/**
 * Firestore Database Service
 * Provides centralized access to Firestore operations with type safety
 */
export class FirestoreService {
  private db = getFirestore();

  /**
   * Tenant Operations
   */
  async createTenant(tenantId: string, data: CreateTenantRequest): Promise<void> {
    const tenantDoc: TenantDocument = {
      ...data,
      status: 'active',
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
    let query = this.db.collection(COLLECTIONS.CALENDARS).where('tenantId', '==', tenantId);
    
    if (activeOnly) {
      query = query.where('isActive', '==', true);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as CalendarDocument }));
  }

  /**
   * Reservation Operations
   */
  async createReservation(reservationId: string, data: CreateReservationRequest): Promise<void> {
    const reservationDoc: ReservationDocument = {
      tenantId: data.tenantId,
      calendarId: data.calendarId,
      start: typeof data.start === 'string' ? Timestamp.fromDate(new Date(data.start)) : data.start,
      end: typeof data.end === 'string' ? Timestamp.fromDate(new Date(data.end)) : data.end,
      userId: '', // Will be set by the calling function with authenticated user ID
      details: data.details,
      status: 'pending',
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
    status?: ReservationDocument['status']
  ): Promise<Array<ReservationDocument & { id: string }>> {
    let query = this.db.collection(COLLECTIONS.RESERVATIONS).where('tenantId', '==', tenantId);

    if (startDate) {
      query = query.where('start', '>=', Timestamp.fromDate(startDate));
    }

    if (endDate) {
      query = query.where('start', '<=', Timestamp.fromDate(endDate));
    }

    if (status) {
      query = query.where('status', '==', status);
    }

    query = query.orderBy('start', 'asc');

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as ReservationDocument }));
  }

  async getReservationsByCalendar(
    calendarId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<ReservationDocument & { id: string }>> {
    const query = this.db.collection(COLLECTIONS.RESERVATIONS)
      .where('calendarId', '==', calendarId)
      .where('start', '>=', Timestamp.fromDate(startDate))
      .where('start', '<=', Timestamp.fromDate(endDate))
      .where('status', 'in', ['pending', 'confirmed'])
      .orderBy('start', 'asc');

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as ReservationDocument }));
  }

  async updateReservationStatus(
    reservationId: string, 
    status: ReservationDocument['status'],
    approvedBy?: string,
    notes?: string
  ): Promise<void> {
    const updateData: Partial<ReservationDocument> = {
      status,
      updatedAt: FieldValue.serverTimestamp() as Timestamp,
      notes,
    };

    if (status === 'confirmed' && approvedBy) {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = FieldValue.serverTimestamp() as Timestamp;
    }

    await this.db.collection(COLLECTIONS.RESERVATIONS).doc(reservationId).update(updateData);
  }

  /**
   * User Operations
   */
  async createUser(userId: string, userData: Omit<UserDocument, 'createdAt' | 'isActive'>): Promise<void> {
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
      .where('tenantId', '==', tenantId)
      .where('isActive', '==', true);

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as UserDocument }));
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
    let query = this.db.collection(COLLECTIONS.RESERVATIONS)
      .where('calendarId', '==', calendarId)
      .where('status', 'in', ['pending', 'confirmed']);

    // Check for overlapping reservations
    // A reservation overlaps if:
    // (start < endTime) AND (end > startTime)
    const snapshot = await query
      .where('start', '<', Timestamp.fromDate(endTime))
      .where('end', '>', Timestamp.fromDate(startTime))
      .get();

    // Filter out the excluded reservation if provided
    const conflictingReservations = snapshot.docs.filter(doc => 
      excludeReservationId ? doc.id !== excludeReservationId : true
    );

    return conflictingReservations.length === 0;
  }

  /**
   * Get tenant's schema configuration for dynamic field validation
   */
  async getTenantSchema(tenantId: string): Promise<TenantDocument['schemaConfig'] | null> {
    const tenant = await this.getTenant(tenantId);
    return tenant?.schemaConfig || null;
  }

  /**
   * Validate reservation details against tenant schema
   */
  validateReservationDetails(
    details: Record<string, any>, 
    schemaConfig: TenantDocument['schemaConfig']
  ): { isValid: boolean; missingFields: string[] } {
    const missingFields = schemaConfig.reservationFields.filter(field => 
      !details.hasOwnProperty(field) || details[field] === null || details[field] === undefined || details[field] === ''
    );

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }
}

// Singleton instance
export const firestoreService = new FirestoreService();
