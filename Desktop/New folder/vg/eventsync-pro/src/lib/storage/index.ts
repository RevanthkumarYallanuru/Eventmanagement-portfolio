// Storage Abstraction Layer
// This layer abstracts storage operations so the app can later migrate to Firebase

import {
  User,
  Event,
  Organizer,
  Guest,
  AttendanceRecord,
  EventFinancials,
  Notification,
  AuditLog,
  PortfolioEvent,
  Testimonial,
  Partner,
  SiteSettings,
  STORAGE_KEYS,
} from './types';
import { generateId } from '@/lib/utils/id';

// Generic storage operations
class StorageService {
  private getItem<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setItem<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private getSingleItem<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private setSingleItem<T>(key: string, data: T | null): void {
    if (data === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  // Users
  getUsers(): User[] {
    return this.getItem<User>(STORAGE_KEYS.USERS);
  }

  setUsers(users: User[]): void {
    this.setItem(STORAGE_KEYS.USERS, users);
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    const users = this.getUsers();
    users.push(user);
    this.setUsers(users);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    users[index] = { ...users[index], ...updates };
    this.setUsers(users);
    return users[index];
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return false;
    this.setUsers(filtered);
    return true;
  }

  // Current User Session
  getCurrentUser(): User | null {
    return this.getSingleItem<User>(STORAGE_KEYS.CURRENT_USER);
  }

  setCurrentUser(user: User | null): void {
    this.setSingleItem(STORAGE_KEYS.CURRENT_USER, user);
  }

  // Events
  getEvents(): Event[] {
    return this.getItem<Event>(STORAGE_KEYS.EVENTS);
  }

  setEvents(events: Event[]): void {
    this.setItem(STORAGE_KEYS.EVENTS, events);
  }

  getEventById(id: string): Event | undefined {
    return this.getEvents().find(e => e.id === id);
  }

  getEventsByOrganizer(organizerId: string): Event[] {
    return this.getEvents().filter(e => e.assignedOrganizers.includes(organizerId));
  }

  createEvent(event: Event): Event {
    const events = this.getEvents();
    events.push(event);
    this.setEvents(events);
    return event;
  }

  updateEvent(id: string, updates: Partial<Event>): Event | undefined {
    const events = this.getEvents();
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return undefined;
    events[index] = { ...events[index], ...updates, updatedAt: new Date().toISOString() };
    this.setEvents(events);
    return events[index];
  }

  deleteEvent(id: string): boolean {
    const events = this.getEvents();
    const filtered = events.filter(e => e.id !== id);
    if (filtered.length === events.length) return false;
    this.setEvents(filtered);
    return true;
  }

  // Organizers
  getOrganizers(): Organizer[] {
    return this.getItem<Organizer>(STORAGE_KEYS.ORGANIZERS);
  }

  setOrganizers(organizers: Organizer[]): void {
    this.setItem(STORAGE_KEYS.ORGANIZERS, organizers);
  }

  getOrganizerById(id: string): Organizer | undefined {
    return this.getOrganizers().find(o => o.id === id);
  }

  getOrganizerByUserId(userId: string): Organizer | undefined {
    return this.getOrganizers().find(o => o.userId === userId);
  }

  createOrganizer(organizer: Organizer): Organizer {
    const organizers = this.getOrganizers();
    organizers.push(organizer);
    this.setOrganizers(organizers);
    return organizer;
  }

  updateOrganizer(id: string, updates: Partial<Organizer>): Organizer | undefined {
    const organizers = this.getOrganizers();
    const index = organizers.findIndex(o => o.id === id);
    if (index === -1) return undefined;
    organizers[index] = { ...organizers[index], ...updates };
    this.setOrganizers(organizers);
    return organizers[index];
  }

  deleteOrganizer(id: string): boolean {
    const organizers = this.getOrganizers();
    const filtered = organizers.filter(o => o.id !== id);
    if (filtered.length === organizers.length) return false;
    this.setOrganizers(filtered);
    return true;
  }

  // Guests
  getGuests(): Guest[] {
    return this.getItem<Guest>(STORAGE_KEYS.GUESTS);
  }

  setGuests(guests: Guest[]): void {
    this.setItem(STORAGE_KEYS.GUESTS, guests);
  }

  getGuestById(id: string): Guest | undefined {
    return this.getGuests().find(g => g.id === id);
  }

  getGuestsByEvent(eventId: string): Guest[] {
    return this.getGuests().filter(g => g.eventId === eventId);
  }

  getGuestByQRCode(qrCode: string): Guest | undefined {
    return this.getGuests().find(g => g.qrCode === qrCode);
  }

  createGuest(guest: Guest): Guest {
    const guests = this.getGuests();
    guests.push(guest);
    this.setGuests(guests);
    return guest;
  }

  createGuestsBatch(newGuests: Guest[]): Guest[] {
    const guests = this.getGuests();
    guests.push(...newGuests);
    this.setGuests(guests);
    return newGuests;
  }

  updateGuest(id: string, updates: Partial<Guest>): Guest | undefined {
    const guests = this.getGuests();
    const index = guests.findIndex(g => g.id === id);
    if (index === -1) return undefined;
    guests[index] = { ...guests[index], ...updates };
    this.setGuests(guests);
    return guests[index];
  }

  deleteGuest(id: string): boolean {
    const guests = this.getGuests();
    const filtered = guests.filter(g => g.id !== id);
    if (filtered.length === guests.length) return false;
    this.setGuests(filtered);
    return true;
  }

  deleteGuestsByEvent(eventId: string): number {
    const guests = this.getGuests();
    const filtered = guests.filter(g => g.eventId !== eventId);
    const deletedCount = guests.length - filtered.length;
    this.setGuests(filtered);
    return deletedCount;
  }

  // Attendance
  getAttendance(): AttendanceRecord[] {
    return this.getItem<AttendanceRecord>(STORAGE_KEYS.ATTENDANCE);
  }

  setAttendance(records: AttendanceRecord[]): void {
    this.setItem(STORAGE_KEYS.ATTENDANCE, records);
  }

  getAttendanceByEvent(eventId: string): AttendanceRecord[] {
    return this.getAttendance().filter(a => a.eventId === eventId);
  }

  getAttendanceByOrganizer(organizerId: string): AttendanceRecord[] {
    return this.getAttendance().filter(a => a.organizerId === organizerId);
  }

  createAttendance(record: AttendanceRecord): AttendanceRecord {
    const records = this.getAttendance();
    records.push(record);
    this.setAttendance(records);
    return record;
  }

  updateAttendance(id: string, updates: Partial<AttendanceRecord>): AttendanceRecord | undefined {
    const records = this.getAttendance();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    records[index] = { ...records[index], ...updates };
    this.setAttendance(records);
    return records[index];
  }

  // Financials
  getFinancials(): EventFinancials[] {
    return this.getItem<EventFinancials>(STORAGE_KEYS.FINANCIALS);
  }

  setFinancials(financials: EventFinancials[]): void {
    this.setItem(STORAGE_KEYS.FINANCIALS, financials);
  }

  getFinancialsByEvent(eventId: string): EventFinancials | undefined {
    return this.getFinancials().find(f => f.eventId === eventId);
  }

  createOrUpdateFinancials(financial: EventFinancials): EventFinancials {
    const financials = this.getFinancials();
    const index = financials.findIndex(f => f.eventId === financial.eventId);
    if (index === -1) {
      financials.push(financial);
    } else {
      financials[index] = financial;
    }
    this.setFinancials(financials);
    return financial;
  }

  // Notifications
  getNotifications(): Notification[] {
    return this.getItem<Notification>(STORAGE_KEYS.NOTIFICATIONS);
  }

  setNotifications(notifications: Notification[]): void {
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  getNotificationsByUser(userId: string): Notification[] {
    return this.getNotifications()
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createNotification(notification: Notification): Notification {
    const notifications = this.getNotifications();
    notifications.push(notification);
    this.setNotifications(notifications);
    return notification;
  }

  markNotificationRead(id: string): void {
    const notifications = this.getNotifications();
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index].read = true;
      this.setNotifications(notifications);
    }
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog>(STORAGE_KEYS.AUDIT_LOGS);
  }

  setAuditLogs(logs: AuditLog[]): void {
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  createAuditLog(log: AuditLog): AuditLog {
    const logs = this.getAuditLogs();
    logs.push(log);
    this.setAuditLogs(logs);
    return log;
  }

  // Portfolio Events
  getPortfolioEvents(): PortfolioEvent[] {
    return this.getItem<PortfolioEvent>(STORAGE_KEYS.PORTFOLIO_EVENTS);
  }

  setPortfolioEvents(events: PortfolioEvent[]): void {
    this.setItem(STORAGE_KEYS.PORTFOLIO_EVENTS, events);
  }

  getPortfolioEventById(id: string): PortfolioEvent | undefined {
    return this.getPortfolioEvents().find(e => e.id === id);
  }

  getFeaturedPortfolioEvents(): PortfolioEvent[] {
    return this.getPortfolioEvents().filter(e => e.featured);
  }

  createPortfolioEvent(event: PortfolioEvent): PortfolioEvent {
    const events = this.getPortfolioEvents();
    events.push(event);
    this.setPortfolioEvents(events);
    return event;
  }

  addPortfolioEvent(eventData: Omit<PortfolioEvent, 'id' | 'createdAt'>): PortfolioEvent {
    const event: PortfolioEvent = {
      id: generateId(),
      ...eventData,
      createdAt: new Date().toISOString(),
    };
    return this.createPortfolioEvent(event);
  }

  updatePortfolioEvent(id: string, updates: Partial<PortfolioEvent>): PortfolioEvent | undefined {
    const events = this.getPortfolioEvents();
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return undefined;
    events[index] = { ...events[index], ...updates };
    this.setPortfolioEvents(events);
    return events[index];
  }

  deletePortfolioEvent(id: string): boolean {
    const events = this.getPortfolioEvents();
    const filtered = events.filter(e => e.id !== id);
    if (filtered.length === events.length) return false;
    this.setPortfolioEvents(filtered);
    return true;
  }

  // Testimonials
  getTestimonials(): Testimonial[] {
    return this.getItem<Testimonial>(STORAGE_KEYS.TESTIMONIALS);
  }

  setTestimonials(testimonials: Testimonial[]): void {
    this.setItem(STORAGE_KEYS.TESTIMONIALS, testimonials);
  }

  getFeaturedTestimonials(): Testimonial[] {
    return this.getTestimonials().filter(t => t.featured);
  }

  createTestimonial(testimonial: Testimonial): Testimonial {
    const testimonials = this.getTestimonials();
    testimonials.push(testimonial);
    this.setTestimonials(testimonials);
    return testimonial;
  }

  addTestimonial(testimonialData: Omit<Testimonial, 'id' | 'createdAt' | 'featured'>): Testimonial {
    const testimonial: Testimonial = {
      id: generateId(),
      ...testimonialData,
      featured: false,
      createdAt: new Date().toISOString(),
    };
    return this.createTestimonial(testimonial);
  }

  updateTestimonial(id: string, updates: Partial<Testimonial>): Testimonial | undefined {
    const testimonials = this.getTestimonials();
    const index = testimonials.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    testimonials[index] = { ...testimonials[index], ...updates };
    this.setTestimonials(testimonials);
    return testimonials[index];
  }

  deleteTestimonial(id: string): boolean {
    const testimonials = this.getTestimonials();
    const filtered = testimonials.filter(t => t.id !== id);
    if (filtered.length === testimonials.length) return false;
    this.setTestimonials(filtered);
    return true;
  }

  // Partners
  getPartners(): Partner[] {
    return this.getItem<Partner>(STORAGE_KEYS.PARTNERS).sort((a, b) => a.order - b.order);
  }

  setPartners(partners: Partner[]): void {
    this.setItem(STORAGE_KEYS.PARTNERS, partners);
  }

  createPartner(partner: Partner): Partner {
    const partners = this.getPartners();
    partners.push(partner);
    this.setPartners(partners);
    return partner;
  }

  updatePartner(id: string, updates: Partial<Partner>): Partner | undefined {
    const partners = this.getPartners();
    const index = partners.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    partners[index] = { ...partners[index], ...updates };
    this.setPartners(partners);
    return partners[index];
  }

  deletePartner(id: string): boolean {
    const partners = this.getPartners();
    const filtered = partners.filter(p => p.id !== id);
    if (filtered.length === partners.length) return false;
    this.setPartners(filtered);
    return true;
  }

  // Site Settings
  getSiteSettings(): SiteSettings {
    const settings = this.getSingleItem<SiteSettings>(STORAGE_KEYS.SITE_SETTINGS);
    return settings || this.getDefaultSiteSettings();
  }

  setSiteSettings(settings: SiteSettings): void {
    this.setSingleItem(STORAGE_KEYS.SITE_SETTINGS, settings);
  }

  private getDefaultSiteSettings(): SiteSettings {
    return {
      companyName: 'EventPro',
      tagline: 'Creating Unforgettable Moments',
      description: 'We are a premier event management company dedicated to crafting extraordinary experiences that leave lasting impressions.',
      email: 'revanthkumaryallanuru@gmail.com',
      phone: '+1 (555) 123-4567',
      address: '123 Event Street, Suite 100, New York, NY 10001',
      socialLinks: {
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
      },
    };
  }

  // Clear all storage data
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Force reinitialize (clear and rebuild)
  forceReinitialize(): void {
    this.clearAllData();
    this.initializeDefaultData();
  }

  // Initialize with default data
  initializeDefaultData(): void {
    // Check if already initialized
    if (this.getUsers().length > 0) return;

    // Create default admin user
    const adminUser: User = {
      id: 'admin-001',
      email: 'admin@eventmgr.com',
      password: 'admin123', // In production, this would be hashed
      name: 'System Admin',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };

    // Create a demo organizer user
    const organizerUser: User = {
      id: 'org-user-001',
      email: 'organizer@eventmgr.com',
      password: 'org123',
      name: 'Demo Organizer',
      role: 'organizer',
      createdAt: new Date().toISOString(),
    };

    this.setUsers([adminUser, organizerUser]);

    // Create corresponding organizer record
    const organizer: Organizer = {
      id: 'org-001',
      userId: 'org-user-001',
      name: 'Demo Organizer',
      email: 'organizer@eventmgr.com',
      phone: '+1234567890',
      assignedEvents: [],
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    this.setOrganizers([organizer]);

    // Initialize default site settings
    this.setSiteSettings(this.getDefaultSiteSettings());

    // Add sample portfolio events
    const samplePortfolioEvents: PortfolioEvent[] = [
      {
        id: 'portfolio-001',
        title: 'Tech Summit 2024',
        description: 'A groundbreaking technology conference bringing together industry leaders, innovators, and enthusiasts for three days of inspiring talks, workshops, and networking.',
        category: 'Corporate',
        date: '2024-03-15',
        location: 'San Francisco, CA',
        coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        images: [
          'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
          'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
        ],
        videos: [],
        highlights: ['500+ Attendees', '30+ Speakers', '3 Days', '20+ Workshops'],
        guestCount: 500,
        featured: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'portfolio-002',
        title: 'Royal Wedding Celebration',
        description: 'An enchanting destination wedding featuring elegant décor, gourmet cuisine, and entertainment that created a fairy-tale experience for the couple and their guests.',
        category: 'Wedding',
        date: '2024-02-20',
        location: 'Malibu, CA',
        coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
        images: [
          'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
        ],
        videos: [],
        highlights: ['200 Guests', 'Beach Venue', 'Live Orchestra', 'Fireworks Show'],
        guestCount: 200,
        featured: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'portfolio-003',
        title: 'Charity Gala Night',
        description: 'An elegant black-tie fundraising event that raised over $500,000 for children\'s education, featuring live auctions, celebrity appearances, and gourmet dining.',
        category: 'Charity',
        date: '2024-01-10',
        location: 'New York, NY',
        coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        images: [
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        ],
        videos: [],
        highlights: ['$500K Raised', '300 Donors', 'Celebrity Host', 'Live Auction'],
        guestCount: 300,
        featured: true,
        createdAt: new Date().toISOString(),
      },
    ];

    this.setPortfolioEvents(samplePortfolioEvents);

    // Add sample testimonials
    const sampleTestimonials: Testimonial[] = [
      {
        id: 'testimonial-001',
        clientName: 'Sarah Johnson',
        clientTitle: 'CEO, TechStart Inc.',
        content: 'EventPro transformed our annual conference into an unforgettable experience. Their attention to detail and creative solutions exceeded all our expectations.',
        rating: 5,
        featured: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'testimonial-002',
        clientName: 'Michael & Emily Chen',
        clientTitle: 'Newlyweds',
        content: 'Our wedding was absolutely magical thanks to EventPro. They handled everything seamlessly and made our dream day come true.',
        rating: 5,
        featured: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'testimonial-003',
        clientName: 'David Martinez',
        clientTitle: 'Director, Hope Foundation',
        content: 'The charity gala organized by EventPro was spectacular. They helped us raise record-breaking donations while creating an elegant atmosphere.',
        rating: 5,
        featured: true,
        createdAt: new Date().toISOString(),
      },
    ];

    this.setTestimonials(sampleTestimonials);

    // Add sample partners
    const samplePartners: Partner[] = [
      {
        id: 'partner-001',
        name: 'Luxury Hotels Group',
        logo: 'https://via.placeholder.com/150x50?text=LHG',
        website: 'https://example.com',
        order: 1,
      },
      {
        id: 'partner-002',
        name: 'Gourmet Catering Co.',
        logo: 'https://via.placeholder.com/150x50?text=GCC',
        website: 'https://example.com',
        order: 2,
      },
      {
        id: 'partner-003',
        name: 'Premier Sound & Lights',
        logo: 'https://via.placeholder.com/150x50?text=PSL',
        website: 'https://example.com',
        order: 3,
      },
      {
        id: 'partner-004',
        name: 'Floral Elegance',
        logo: 'https://via.placeholder.com/150x50?text=FE',
        website: 'https://example.com',
        order: 4,
      },
    ];

    this.setPartners(samplePartners);
  }
}

// Export singleton instance
export const storage = new StorageService();

// Export types
export * from './types';
