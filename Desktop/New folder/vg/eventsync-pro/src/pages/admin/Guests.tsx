import React, { useState, useMemo, useRef } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { storage, Guest, Event, IdType, RsvpStatus } from '@/lib/storage';
import { generateId, generateQRCode } from '@/lib/utils/id';
import {
  UserCheck,
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  Download,
  Mail,
  Send,
  QrCode,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminGuests() {
  const [guests, setGuests] = useState<Guest[]>(() => storage.getGuests());
  const [events] = useState<Event[]>(() => storage.getEvents());
  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    eventId: '',
    name: '',
    email: '',
    phone: '',
    idType: 'national_id' as IdType,
    idNumber: '',
    rsvpStatus: 'pending' as RsvpStatus,
  });

  // Upload state
  const [uploadEventId, setUploadEventId] = useState('');
  const [uploadData, setUploadData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [uploadStep, setUploadStep] = useState<'select' | 'map' | 'preview'>('select');

  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const matchesSearch =
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.phone.includes(searchQuery);
      const matchesEvent = eventFilter === 'all' || guest.eventId === eventFilter;
      const matchesStatus = statusFilter === 'all' || guest.checkInStatus === statusFilter;
      return matchesSearch && matchesEvent && matchesStatus;
    });
  }, [guests, searchQuery, eventFilter, statusFilter]);

  const resetForm = () => {
    setFormData({
      eventId: events.length > 0 ? events[0].id : '',
      name: '',
      email: '',
      phone: '',
      idType: 'national_id',
      idNumber: '',
      rsvpStatus: 'pending',
    });
    setEditingGuest(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      eventId: guest.eventId,
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
      idType: guest.idType,
      idNumber: guest.idNumber,
      rsvpStatus: guest.rsvpStatus,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingGuest) {
      storage.updateGuest(editingGuest.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        idType: formData.idType,
        idNumber: formData.idNumber,
        rsvpStatus: formData.rsvpStatus,
      });
      setGuests(storage.getGuests());
    } else {
      const guestId = generateId('gst');
      const newGuest: Guest = {
        id: guestId,
        eventId: formData.eventId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        idType: formData.idType,
        idNumber: formData.idNumber,
        qrCode: generateQRCode(guestId, formData.eventId),
        rsvpStatus: formData.rsvpStatus,
        checkInStatus: 'not_checked_in',
        invitationSent: false,
        createdAt: new Date().toISOString(),
      };
      storage.createGuest(newGuest);
      setGuests(storage.getGuests());
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (guestId: string) => {
    storage.deleteGuest(guestId);
    setGuests(storage.getGuests());
    setDeleteConfirmId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        return row;
      });

      setUploadData(data);
      // Auto-map columns
      const mapping: Record<string, string> = {};
      const fieldMappings: Record<string, string[]> = {
        name: ['name', 'full name', 'guest name', 'fullname'],
        email: ['email', 'e-mail', 'email address'],
        phone: ['phone', 'telephone', 'mobile', 'phone number'],
        idType: ['id type', 'idtype', 'document type'],
        idNumber: ['id number', 'idnumber', 'document number'],
      };

      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        Object.entries(fieldMappings).forEach(([field, aliases]) => {
          if (aliases.some(alias => lowerHeader.includes(alias))) {
            mapping[field] = header;
          }
        });
      });

      setColumnMapping(mapping);
      setUploadStep('map');
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processUpload = () => {
    const existingGuests = storage.getGuestsByEvent(uploadEventId);
    const existingEmails = new Set(existingGuests.map(g => g.email.toLowerCase()));
    const existingPhones = new Set(existingGuests.map(g => g.phone));

    const newGuests: Guest[] = [];
    const duplicates: any[] = [];

    uploadData.forEach(row => {
      const email = row[columnMapping.email]?.toLowerCase() || '';
      const phone = row[columnMapping.phone] || '';

      if (existingEmails.has(email) || existingPhones.has(phone)) {
        duplicates.push(row);
        return;
      }

      const guestId = generateId('gst');
      newGuests.push({
        id: guestId,
        eventId: uploadEventId,
        name: row[columnMapping.name] || '',
        email: email,
        phone: phone,
        idType: (row[columnMapping.idType] as IdType) || 'national_id',
        idNumber: row[columnMapping.idNumber] || '',
        qrCode: generateQRCode(guestId, uploadEventId),
        rsvpStatus: 'pending',
        checkInStatus: 'not_checked_in',
        invitationSent: false,
        createdAt: new Date().toISOString(),
      });
    });

    if (newGuests.length > 0) {
      storage.createGuestsBatch(newGuests);
      setGuests(storage.getGuests());
    }

    alert(`Imported ${newGuests.length} guests. ${duplicates.length} duplicates skipped.`);
    setIsUploadModalOpen(false);
    setUploadStep('select');
    setUploadData([]);
    setColumnMapping({});
    setUploadEventId('');
  };

  const sendInvitations = () => {
    const toSend = selectedGuests.length > 0 
      ? guests.filter(g => selectedGuests.includes(g.id) && !g.invitationSent)
      : filteredGuests.filter(g => !g.invitationSent);

    toSend.forEach(guest => {
      storage.updateGuest(guest.id, {
        invitationSent: true,
        invitationSentAt: new Date().toISOString(),
      });
      console.log(`[Email Simulation] Invitation sent to ${guest.email} for event ${guest.eventId}`);
    });

    setGuests(storage.getGuests());
    setSelectedGuests([]);
    alert(`Sent ${toSend.length} invitation(s)`);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'ID Type', 'ID Number', 'RSVP Status', 'Check-in Status', 'QR Code'];
    const rows = filteredGuests.map(g => [
      g.name,
      g.email,
      g.phone,
      g.idType,
      g.idNumber,
      g.rsvpStatus,
      g.checkInStatus,
      g.qrCode,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guests-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelectAll = () => {
    if (selectedGuests.length === filteredGuests.length) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(filteredGuests.map(g => g.id));
    }
  };

  const toggleSelectGuest = (guestId: string) => {
    setSelectedGuests(prev =>
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
  };

  const getEventName = (eventId: string) => {
    return events.find(e => e.id === eventId)?.name || 'Unknown Event';
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Guests</h1>
            <p className="text-muted-foreground mt-1">Manage guest lists and invitations</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsUploadModalOpen(true)} className="btn-secondary">
              <Upload size={20} />
              Import
            </button>
            <button onClick={openCreateModal} className="btn-primary">
              <Plus size={20} />
              Add Guest
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="input-field w-full lg:w-56"
          >
            <option value="all">All Events</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-full lg:w-48"
          >
            <option value="all">All Statuses</option>
            <option value="not_checked_in">Not Checked In</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
          </select>
        </div>

        {/* Actions Bar */}
        {filteredGuests.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <button onClick={sendInvitations} className="btn-secondary">
              <Send size={16} />
              Send Invitations {selectedGuests.length > 0 ? `(${selectedGuests.length})` : ''}
            </button>
            <button onClick={exportToCSV} className="btn-secondary">
              <Download size={16} />
              Export CSV
            </button>
          </div>
        )}

        {/* Guests Table */}
        {filteredGuests.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No guests found"
            description={searchQuery || eventFilter !== 'all' ? 'Try adjusting your filters' : 'Add guests to your events'}
            action={!searchQuery && eventFilter === 'all' ? { label: 'Add Guest', onClick: openCreateModal } : undefined}
          />
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedGuests.length === filteredGuests.length}
                        onChange={toggleSelectAll}
                        className="rounded border-input"
                      />
                    </th>
                    <th>Guest</th>
                    <th>Event</th>
                    <th>Contact</th>
                    <th>RSVP</th>
                    <th>Check-in</th>
                    <th>Invitation</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map((guest) => (
                    <tr key={guest.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedGuests.includes(guest.id)}
                          onChange={() => toggleSelectGuest(guest.id)}
                          className="rounded border-input"
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <QrCode size={16} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{guest.name}</p>
                            <p className="text-xs text-muted-foreground">{guest.idType}: {guest.idNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-foreground">{getEventName(guest.eventId)}</span>
                      </td>
                      <td>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>{guest.email}</p>
                          <p>{guest.phone}</p>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={guest.rsvpStatus} />
                      </td>
                      <td>
                        <StatusBadge status={guest.checkInStatus} />
                      </td>
                      <td>
                        {guest.invitationSent ? (
                          <span className="text-xs text-success flex items-center gap-1">
                            <Mail size={12} />
                            Sent
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not sent</span>
                        )}
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(guest)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(guest.id)}
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingGuest ? 'Edit Guest' : 'Add Guest'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {!editingGuest && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Event</label>
                <select
                  value={formData.eventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select an event</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="Enter email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">ID Type</label>
                <select
                  value={formData.idType}
                  onChange={(e) => setFormData({ ...formData, idType: e.target.value as IdType })}
                  className="input-field"
                >
                  <option value="national_id">National ID</option>
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">ID Number</label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  className="input-field"
                  placeholder="Enter ID number"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">RSVP Status</label>
              <select
                value={formData.rsvpStatus}
                onChange={(e) => setFormData({ ...formData, rsvpStatus: e.target.value as RsvpStatus })}
                className="input-field"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="declined">Declined</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingGuest ? 'Update Guest' : 'Add Guest'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Upload Modal */}
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setUploadStep('select');
            setUploadData([]);
            setColumnMapping({});
            setUploadEventId('');
          }}
          title="Import Guests"
          size="lg"
        >
          <div className="space-y-6">
            {uploadStep === 'select' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Select Event</label>
                  <select
                    value={uploadEventId}
                    onChange={(e) => setUploadEventId(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select an event</option>
                    {events.map(event => (
                      <option key={event.id} value={event.id}>{event.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Upload CSV File</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={!uploadEventId}
                    className="input-field"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    CSV should have headers: name, email, phone, id type, id number
                  </p>
                </div>
              </>
            )}

            {uploadStep === 'map' && (
              <>
                <p className="text-sm text-muted-foreground">
                  Found {uploadData.length} rows. Map the columns to guest fields:
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {['name', 'email', 'phone', 'idType', 'idNumber'].map(field => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-foreground mb-2 capitalize">{field}</label>
                      <select
                        value={columnMapping[field] || ''}
                        onChange={(e) => setColumnMapping({ ...columnMapping, [field]: e.target.value })}
                        className="input-field"
                      >
                        <option value="">-- Select Column --</option>
                        {uploadData[0] && Object.keys(uploadData[0]).map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border">
                  <button
                    onClick={() => setUploadStep('select')}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    onClick={processUpload}
                    disabled={!columnMapping.name || !columnMapping.email}
                    className="btn-primary"
                  >
                    Import {uploadData.length} Guests
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Guest"
          size="sm"
        >
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Are you sure you want to delete this guest?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)} className="btn-danger">
                Delete Guest
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
