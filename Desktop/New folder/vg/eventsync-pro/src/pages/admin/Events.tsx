import React, { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { storage, Event, EventStatus } from '@/lib/storage';
import { generateId } from '@/lib/utils/id';
import {
  Calendar,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  MapPin,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>(() => storage.getEvents());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    startDate: '',
    endDate: '',
    venueName: '',
    venueAddress: '',
    status: 'draft' as EventStatus,
    assignedOrganizers: [] as string[],
  });

  const organizers = useMemo(() => storage.getOrganizers().filter(o => o.status === 'active'), []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, statusFilter]);

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      startDate: '',
      endDate: '',
      venueName: '',
      venueAddress: '',
      status: 'draft',
      assignedOrganizers: [],
    });
    setEditingEvent(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      type: event.type,
      description: event.description,
      startDate: event.dates.start.split('T')[0],
      endDate: event.dates.end.split('T')[0],
      venueName: event.venue.name,
      venueAddress: event.venue.address,
      status: event.status,
      assignedOrganizers: event.assignedOrganizers,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEvent) {
      // Get previous organizers to sync assignments
      const previousOrganizers = editingEvent.assignedOrganizers;
      const newOrganizers = formData.assignedOrganizers;

      // Update existing event
      const updated = storage.updateEvent(editingEvent.id, {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        dates: {
          start: new Date(formData.startDate).toISOString(),
          end: new Date(formData.endDate).toISOString(),
        },
        venue: {
          name: formData.venueName,
          address: formData.venueAddress,
        },
        status: formData.status,
        assignedOrganizers: newOrganizers,
      });

      if (updated) {
        // Remove event from organizers who were unassigned
        previousOrganizers.forEach((orgId) => {
          if (!newOrganizers.includes(orgId)) {
            const org = storage.getOrganizerById(orgId);
            if (org) {
              storage.updateOrganizer(orgId, {
                assignedEvents: org.assignedEvents.filter(id => id !== editingEvent.id),
              });
            }
          }
        });

        // Add event to newly assigned organizers
        newOrganizers.forEach((orgId) => {
          if (!previousOrganizers.includes(orgId)) {
            const org = storage.getOrganizerById(orgId);
            if (org && !org.assignedEvents.includes(editingEvent.id)) {
              storage.updateOrganizer(orgId, {
                assignedEvents: [...org.assignedEvents, editingEvent.id],
              });
            }
          }
        });

        setEvents(storage.getEvents());
      }
    } else {
      // Create new event
      const newEvent: Event = {
        id: generateId('evt'),
        name: formData.name,
        type: formData.type,
        description: formData.description,
        dates: {
          start: new Date(formData.startDate).toISOString(),
          end: new Date(formData.endDate).toISOString(),
        },
        venue: {
          name: formData.venueName,
          address: formData.venueAddress,
        },
        status: formData.status,
        assignedOrganizers: formData.assignedOrganizers,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.createEvent(newEvent);
      setEvents(storage.getEvents());

      // Update organizers' assigned events
      formData.assignedOrganizers.forEach((orgId) => {
        const org = storage.getOrganizerById(orgId);
        if (org && !org.assignedEvents.includes(newEvent.id)) {
          storage.updateOrganizer(orgId, {
            assignedEvents: [...org.assignedEvents, newEvent.id],
          });
        }
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (eventId: string) => {
    storage.deleteEvent(eventId);
    storage.deleteGuestsByEvent(eventId);
    setEvents(storage.getEvents());
    setDeleteConfirmId(null);
  };

  const getGuestCount = (eventId: string) => {
    return storage.getGuestsByEvent(eventId).length;
  };

  const getCheckedInCount = (eventId: string) => {
    return storage.getGuestsByEvent(eventId).filter(g => g.checkInStatus === 'checked_in').length;
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Events</h1>
            <p className="text-muted-foreground mt-1">Create and manage your events</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary">
            <Plus size={20} />
            Create Event
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EventStatus | 'all')}
            className="input-field w-full sm:w-48"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="ready">Ready</option>
            <option value="live">Live</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No events found"
            description={searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first event to get started'}
            action={!searchQuery && statusFilter === 'all' ? { label: 'Create Event', onClick: openCreateModal } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <StatusBadge status={event.status} />
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(event)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        disabled={event.status === 'closed'}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(event.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">{event.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description || 'No description'}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={14} />
                      <span>{format(new Date(event.dates.start), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin size={14} />
                      <span className="truncate">{event.venue.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users size={14} />
                      <span>{getCheckedInCount(event.id)} / {getGuestCount(event.id)} checked in</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3 bg-muted/50 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    {event.assignedOrganizers.length} organizer(s) assigned
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingEvent ? 'Edit Event' : 'Create Event'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Event Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter event name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Event Type</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Conference, Wedding"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field min-h-[100px] resize-none"
                placeholder="Event description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Venue Name</label>
                <input
                  type="text"
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  className="input-field"
                  placeholder="Venue name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Venue Address</label>
                <input
                  type="text"
                  value={formData.venueAddress}
                  onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                  className="input-field"
                  placeholder="Venue address"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as EventStatus })}
                  className="input-field"
                >
                  <option value="draft">Draft</option>
                  <option value="ready">Ready</option>
                  <option value="live">Live</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Assign Organizers</label>
                <select
                  multiple
                  value={formData.assignedOrganizers}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                    setFormData({ ...formData, assignedOrganizers: selected });
                  }}
                  className="input-field min-h-[80px]"
                >
                  {organizers.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
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
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Event"
          size="sm"
        >
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Are you sure you want to delete this event? This action cannot be undone and will also remove all associated guests.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)} className="btn-danger">
                Delete Event
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
