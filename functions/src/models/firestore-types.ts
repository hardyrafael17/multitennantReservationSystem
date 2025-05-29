import { Timestamp } from 'firebase-admin/firestore';

/**
 * Tenant Document Interface
 * Represents a tenant organization in the multi-tenant system
 */
export interface TenantDocument {
  name: string;                    // Display name of the tenant organization
  domain: string;                  // Domain for tenant identification (e.g., "company.com")
  schemaConfig: {
    reservationFields: string[];   // Custom fields for reservations ["name", "email", "serviceType"]
    requiresApproval: boolean;     // Whether reservations need manual approval
  };
  createdAt: Timestamp;           // When tenant was created
  updatedAt: Timestamp;           // Last modification time
  status: 'active' | 'suspended' | 'pending'; // Tenant status
  settings?: {                    // Optional tenant-specific settings
    timeZone: string;             // Default timezone (e.g., "America/New_York")
    businessHours: {
      start: string;              // Default start time "09:00"
      end: string;                // Default end time "17:00"
    };
    maxAdvanceBooking: number;    // Days in advance bookings allowed
  };
}

/**
 * Calendar Document Interface
 * Represents a bookable resource/calendar with availability schedules
 */
export interface CalendarDocument {
  tenantId: string;               // Foreign key to tenants collection
  name: string;                   // Calendar display name
  description?: string;           // Optional calendar description
  availability: {
    [weekday: string]: {          // "monday", "tuesday", etc.
      start: string;              // Start time "09:00"
      end: string;                // End time "17:00"
      breaks?: Array<{            // Optional breaks during the day
        start: string;
        end: string;
        name: string;
      }>;
    };
  };
  slotDuration: number;           // Booking slot duration in minutes
  bufferTime?: number;            // Buffer time between bookings in minutes
  maxConcurrentBookings: number; // Maximum simultaneous bookings
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;              // Whether calendar accepts new bookings
  bookingRules?: {                // Optional booking constraints
    minAdvanceNotice: number;     // Minimum hours advance notice required
    maxBookingDuration: number;   // Maximum booking duration in minutes
    allowWeekends: boolean;       // Allow weekend bookings
  };
}

/**
 * Reservation Document Interface
 * Represents actual booking records with flexible details
 */
export interface ReservationDocument {
  tenantId: string;               // Foreign key to tenants collection
  calendarId: string;             // Foreign key to calendars collection
  start: Timestamp;               // Reservation start time
  end: Timestamp;                 // Reservation end time
  userId: string;                 // ID of user who made the reservation
  details: Record<string, any>;   // Flexible object based on tenant's schemaConfig.reservationFields
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  approvedBy?: string;            // User ID who approved (if requiresApproval is true)
  approvedAt?: Timestamp;         // When reservation was approved
  cancellationReason?: string;    // Reason for cancellation
  notes?: string;                 // Additional notes from staff
  metadata?: {                    // System metadata
    source: 'web' | 'api' | 'admin'; // How reservation was created
    ipAddress?: string;           // IP address of creator
    userAgent?: string;           // Browser/client information
  };
}

/**
 * User Document Interface
 * Represents user profiles and tenant associations
 */
export interface UserDocument {
  email: string;                  // User's email address
  displayName: string;            // User's display name
  tenantId: string;               // Associated tenant
  role: 'admin' | 'staff' | 'user'; // User role within tenant
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
  isActive: boolean;
  preferences?: {
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
    };
  };
}

/**
 * Collection Names Constants
 */
export const COLLECTIONS = {
  TENANTS: 'tenants',
  CALENDARS: 'calendars',
  RESERVATIONS: 'reservations',
  USERS: 'users',
} as const;

/**
 * Type for collection names
 */
export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

/**
 * Request DTOs for API operations
 */
export interface CreateTenantRequest {
  name: string;
  domain: string;
  schemaConfig: {
    reservationFields: string[];
    requiresApproval: boolean;
  };
  settings?: TenantDocument['settings'];
}

export interface CreateCalendarRequest {
  tenantId: string;
  name: string;
  description?: string;
  availability: CalendarDocument['availability'];
  slotDuration: number;
  bufferTime?: number;
  maxConcurrentBookings: number;
  bookingRules?: CalendarDocument['bookingRules'];
}

export interface CreateReservationRequest {
  tenantId: string;
  calendarId: string;
  start: string | Timestamp; // ISO string or Timestamp
  end: string | Timestamp;   // ISO string or Timestamp
  details: Record<string, any>;
  metadata?: ReservationDocument['metadata'];
}

export interface UpdateReservationRequest {
  status?: ReservationDocument['status'];
  details?: Record<string, any>;
  notes?: string;
  cancellationReason?: string;
}

/**
 * Response DTOs for API operations
 */
export interface TenantResponse extends Omit<TenantDocument, 'createdAt' | 'updatedAt'> {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarResponse extends Omit<CalendarDocument, 'createdAt' | 'updatedAt'> {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationResponse extends Omit<ReservationDocument, 'start' | 'end' | 'createdAt' | 'updatedAt' | 'approvedAt'> {
  id: string;
  start: string;
  end: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

export interface UserResponse extends Omit<UserDocument, 'createdAt' | 'lastLoginAt'> {
  id: string;
  createdAt: string;
  lastLoginAt?: string;
}
