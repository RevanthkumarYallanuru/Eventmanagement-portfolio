import React, { useState, useMemo, useEffect, useRef } from 'react';
import { OrganizerLayout } from '@/components/layout/OrganizerLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { storage, Guest, Event, AttendanceRecord, VerificationMethod } from '@/lib/storage';
import { generateId } from '@/lib/utils/id';
import {
  QrCode,
  Search,
  UserCheck,
  UserX,
  Camera,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

export default function OrganizerCheckIn() {
  const { user } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [checkInResult, setCheckInResult] = useState<{
    type: 'success' | 'error' | 'already';
    guest?: Guest;
    message: string;
  } | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>('manual_search');
  const qrInputRef = useRef<HTMLInputElement>(null);

  const organizerData = useMemo(() => {
    const organizer = storage.getOrganizerByUserId(user?.id || '');
    if (!organizer) return null;

    const assignedEvents = organizer.assignedEvents
      .map(eventId => storage.getEventById(eventId))
      .filter(Boolean)
      .filter(event => event!.status === 'live') as Event[];

    return { organizer, assignedEvents };
  }, [user]);

  // Set default event
  useEffect(() => {
    if (organizerData?.assignedEvents.length && !selectedEventId) {
      setSelectedEventId(organizerData.assignedEvents[0].id);
    }
  }, [organizerData, selectedEventId]);

  const guests = useMemo(() => {
    if (!selectedEventId) return [];
    return storage.getGuestsByEvent(selectedEventId);
  }, [selectedEventId]);

  const filteredGuests = useMemo(() => {
    if (!searchQuery) return guests; // Show all guests when no search
    const query = searchQuery.toLowerCase();
    return guests.filter(
      g =>
        g.name.toLowerCase().includes(query) ||
        g.phone.includes(query) ||
        g.idNumber.toLowerCase().includes(query)
    );
  }, [guests, searchQuery]);

  const stats = useMemo(() => {
    const total = guests.length;
    const checkedIn = guests.filter(g => g.checkInStatus === 'checked_in').length;
    const notCheckedIn = guests.filter(g => g.checkInStatus === 'not_checked_in').length;
    return { total, checkedIn, notCheckedIn };
  }, [guests]);

  const performCheckIn = (guest: Guest, method: VerificationMethod) => {
    if (!organizerData?.organizer) return;

    if (guest.checkInStatus === 'checked_in') {
      setCheckInResult({
        type: 'already',
        guest,
        message: `${guest.name} is already checked in.`,
      });
      return;
    }

    // Update guest
    storage.updateGuest(guest.id, {
      checkInStatus: 'checked_in',
      checkInTime: new Date().toISOString(),
      verificationMethod: method,
    });

    // Create attendance record
    const attendance: AttendanceRecord = {
      id: generateId('att'),
      guestId: guest.id,
      eventId: guest.eventId,
      organizerId: organizerData.organizer.id,
      checkInTime: new Date().toISOString(),
      verificationMethod: method,
    };
    storage.createAttendance(attendance);

    setCheckInResult({
      type: 'success',
      guest,
      message: `${guest.name} has been checked in successfully!`,
    });

    // Clear search
    setSearchQuery('');
    setQrInput('');
    setSelectedGuest(null);
  };

  const handleQRSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) return;

    const guest = storage.getGuestByQRCode(qrInput.trim());
    if (!guest) {
      setCheckInResult({
        type: 'error',
        message: 'Invalid QR code. Guest not found.',
      });
      setQrInput('');
      return;
    }

    if (guest.eventId !== selectedEventId) {
      setCheckInResult({
        type: 'error',
        message: 'This QR code is for a different event.',
      });
      setQrInput('');
      return;
    }

    performCheckIn(guest, 'qr_scan');
  };

  const handleGuestSelect = (guest: Guest) => {
    setSelectedGuest(guest);
    setSearchQuery('');
  };

  const handleManualCheckIn = () => {
    if (!selectedGuest) return;
    performCheckIn(selectedGuest, verificationMethod);
  };

  const handleCheckOut = (guest: Guest) => {
    storage.updateGuest(guest.id, {
      checkInStatus: 'checked_out',
      checkOutTime: new Date().toISOString(),
    });

    // Update attendance record
    const attendance = storage.getAttendanceByEvent(guest.eventId)
      .find(a => a.guestId === guest.id && !a.checkOutTime);
    if (attendance) {
      storage.updateAttendance(attendance.id, {
        checkOutTime: new Date().toISOString(),
      });
    }

    setCheckInResult({
      type: 'success',
      guest,
      message: `${guest.name} has been checked out.`,
    });
    setSelectedGuest(null);
  };

  if (!organizerData) {
    return (
      <OrganizerLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Unable to load organizer data.</p>
        </div>
      </OrganizerLayout>
    );
  }

  if (organizerData.assignedEvents.length === 0) {
    return (
      <OrganizerLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <QrCode size={48} className="text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground">No Live Events</h2>
          <p className="text-muted-foreground mt-2">
            You don't have any live events assigned. Contact an admin for assistance.
          </p>
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Guest Check-In</h1>
            <p className="text-muted-foreground mt-1">Verify and check in guests</p>
          </div>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="input-field w-full sm:w-64"
          >
            {organizerData.assignedEvents.map(event => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-success">{stats.checkedIn}</p>
            <p className="text-sm text-muted-foreground">Checked In</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-warning">{stats.notCheckedIn}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
        </div>

        {/* Check-in Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Scanner */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <QrCode size={18} />
                QR Code Check-In
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleQRSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    ref={qrInputRef}
                    type="text"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder="Scan or enter QR code..."
                    className="input-field text-center text-lg font-mono"
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn-success w-full">
                  <UserCheck size={20} />
                  Verify & Check In
                </button>
              </form>

              <div className="mt-6 p-4 rounded-lg bg-muted/50 text-center">
                <Camera size={32} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Use a barcode scanner or paste the QR code value
                </p>
              </div>
            </div>
          </div>

          {/* Manual Search */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Search size={18} />
                Manual Search
              </h2>
            </div>
            <div className="p-6">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, phone, or ID..."
                  className="input-field pl-10"
                />
              </div>

              {/* Search Results */}
              {filteredGuests.length > 0 && (
                <div className="mt-4 border border-border rounded-lg overflow-hidden divide-y divide-border max-h-[300px] overflow-y-auto">
                  {filteredGuests.map((guest) => (
                    <button
                      key={guest.id}
                      onClick={() => handleGuestSelect(guest)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                    >
                      <div>
                        <p className="font-medium text-foreground">{guest.name}</p>
                        <p className="text-sm text-muted-foreground">{guest.phone}</p>
                      </div>
                      <StatusBadge status={guest.checkInStatus} size="sm" />
                    </button>
                  ))}
                </div>
              )}

              {searchQuery && filteredGuests.length === 0 && (
                <div className="mt-4 p-4 rounded-lg bg-muted/50 text-center text-muted-foreground text-sm">
                  No guests found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Result Notification */}
        {checkInResult && (
          <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md p-4 rounded-xl shadow-lg border animate-slide-in ${
              checkInResult.type === 'success'
                ? 'bg-success/10 border-success/30'
                : checkInResult.type === 'already'
                ? 'bg-warning/10 border-warning/30'
                : 'bg-destructive/10 border-destructive/30'
            }`}
          >
            <div className="flex items-start gap-3">
              {checkInResult.type === 'success' ? (
                <CheckCircle2 size={24} className="text-success flex-shrink-0" />
              ) : checkInResult.type === 'already' ? (
                <AlertCircle size={24} className="text-warning flex-shrink-0" />
              ) : (
                <XCircle size={24} className="text-destructive flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  checkInResult.type === 'success'
                    ? 'text-success'
                    : checkInResult.type === 'already'
                    ? 'text-warning'
                    : 'text-destructive'
                }`}>
                  {checkInResult.message}
                </p>
                {checkInResult.guest && checkInResult.type === 'success' && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(), 'HH:mm:ss')}
                  </p>
                )}
              </div>
              <button
                onClick={() => setCheckInResult(null)}
                className="p-1 rounded hover:bg-foreground/10 transition-colors"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        )}

        {/* Guest Details Modal */}
        <Modal
          isOpen={!!selectedGuest}
          onClose={() => setSelectedGuest(null)}
          title="Guest Verification"
          size="md"
        >
          {selectedGuest && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  {selectedGuest.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{selectedGuest.name}</h3>
                  <StatusBadge status={selectedGuest.checkInStatus} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{selectedGuest.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{selectedGuest.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID Type</p>
                  <p className="font-medium text-foreground capitalize">{selectedGuest.idType.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID Number</p>
                  <p className="font-medium text-foreground">{selectedGuest.idNumber}</p>
                </div>
              </div>

              {selectedGuest.checkInStatus === 'not_checked_in' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Verification Method
                    </label>
                    <select
                      value={verificationMethod}
                      onChange={(e) => setVerificationMethod(e.target.value as VerificationMethod)}
                      className="input-field"
                    >
                      <option value="manual_search">Manual Search</option>
                      <option value="id_check">ID Verification</option>
                      <option value="qr_scan">QR Scan</option>
                    </select>
                  </div>

                  <button onClick={handleManualCheckIn} className="btn-success w-full">
                    <UserCheck size={20} />
                    Check In Guest
                  </button>
                </>
              )}

              {selectedGuest.checkInStatus === 'checked_in' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <div className="flex items-center gap-2 text-success mb-2">
                      <CheckCircle2 size={18} />
                      <span className="font-medium">Already Checked In</span>
                    </div>
                    {selectedGuest.checkInTime && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock size={14} />
                        {format(new Date(selectedGuest.checkInTime), 'MMM d, yyyy HH:mm')}
                      </p>
                    )}
                  </div>

                  <button 
                    onClick={() => handleCheckOut(selectedGuest)} 
                    className="btn-secondary w-full"
                  >
                    <UserX size={20} />
                    Check Out Guest
                  </button>
                </div>
              )}

              {selectedGuest.checkInStatus === 'checked_out' && (
                <div className="p-4 rounded-lg bg-muted border border-border">
                  <p className="text-muted-foreground">This guest has already checked out.</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </OrganizerLayout>
  );
}
