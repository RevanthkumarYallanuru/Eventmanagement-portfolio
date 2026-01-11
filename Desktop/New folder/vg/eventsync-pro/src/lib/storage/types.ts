// Core Types for Event Management System

export type UserRole = 'admin' | 'organizer';

export interface User {
  id: string;
  email: string;
  password: string; // In production, this would be hashed
  name: string;
  role: UserRole;
  createdAt: string;
}

export type EventStatus = 'draft' | 'ready' | 'live' | 'closed';

export interface Event {
  id: string;
  name: string;
  type: string;
  description: string;
  dates: {
    start: string;
    end: string;
  };
  venue: {
    name: string;
    address: string;
  };
  status: EventStatus;
  assignedOrganizers: string[];
  createdAt: string;
  updatedAt: string;
}

export type OrganizerStatus = 'active' | 'inactive';

export interface Organizer {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  assignedEvents: string[];
  status: OrganizerStatus;
  createdAt: string;
}

export type RsvpStatus = 'pending' | 'confirmed' | 'declined';
export type CheckInStatus = 'not_checked_in' | 'checked_in' | 'checked_out';
export type IdType = 'passport' | 'national_id' | 'drivers_license' | 'other';
export type VerificationMethod = 'qr_scan' | 'manual_search' | 'id_check';

export interface Guest {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  idType: IdType;
  idNumber: string;
  qrCode: string;
  rsvpStatus: RsvpStatus;
  checkInStatus: CheckInStatus;
  checkInTime?: string;
  checkOutTime?: string;
  verificationMethod?: VerificationMethod;
  invitationSent: boolean;
  invitationSentAt?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  guestId: string;
  eventId: string;
  organizerId: string;
  checkInTime: string;
  checkOutTime?: string;
  verificationMethod: VerificationMethod;
}

export interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface IncomeItem {
  id: string;
  description: string;
  amount: number;
  source: string;
  date: string;
}

export interface EventFinancials {
  eventId: string;
  expenses: ExpenseItem[];
  income: IncomeItem[];
  totalExpense: number;
  totalIncome: number;
  profit: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'invitation_sent' | 'guest_checked_in' | 'event_updated' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  createdAt: string;
}

// Portfolio types for public website
export interface PortfolioEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  coverImage: string;
  images: string[];
  videos: string[];
  highlights: string[];
  guestCount?: number;
  featured: boolean;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientTitle: string;
  clientImage?: string;
  content: string;
  rating: number;
  eventId?: string;
  featured: boolean;
  createdAt: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  website?: string;
  order: number;
}

export interface SiteSettings {
  companyName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  heroImage?: string;
  aboutImage?: string;
}

// Storage Keys
export const STORAGE_KEYS = {
  USERS: 'eventmgr_users',
  EVENTS: 'eventmgr_events',
  ORGANIZERS: 'eventmgr_organizers',
  GUESTS: 'eventmgr_guests',
  ATTENDANCE: 'eventmgr_attendance',
  FINANCIALS: 'eventmgr_financials',
  NOTIFICATIONS: 'eventmgr_notifications',
  AUDIT_LOGS: 'eventmgr_audit_logs',
  CURRENT_USER: 'eventmgr_current_user',
  PORTFOLIO_EVENTS: 'eventmgr_portfolio_events',
  TESTIMONIALS: 'eventmgr_testimonials',
  PARTNERS: 'eventmgr_partners',
  SITE_SETTINGS: 'eventmgr_site_settings',
} as const;
