import React, { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { storage, Organizer, OrganizerStatus, User } from '@/lib/storage';
import { generateId } from '@/lib/utils/id';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';

export default function AdminOrganizers() {
  const [organizers, setOrganizers] = useState<Organizer[]>(() => storage.getOrganizers());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrganizerStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrganizer, setEditingOrganizer] = useState<Organizer | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: 'active' as OrganizerStatus,
  });

  const filteredOrganizers = useMemo(() => {
    return organizers.filter((org) => {
      const matchesSearch =
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [organizers, searchQuery, statusFilter]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      status: 'active',
    });
    setEditingOrganizer(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (organizer: Organizer) => {
    setEditingOrganizer(organizer);
    setFormData({
      name: organizer.name,
      email: organizer.email,
      phone: organizer.phone,
      password: '',
      status: organizer.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingOrganizer) {
      // Update existing organizer
      storage.updateOrganizer(editingOrganizer.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
      });

      // Update corresponding user
      const user = storage.getUserById(editingOrganizer.userId);
      if (user) {
        storage.updateUser(editingOrganizer.userId, {
          name: formData.name,
          email: formData.email,
          ...(formData.password ? { password: formData.password } : {}),
        });
      }

      setOrganizers(storage.getOrganizers());
    } else {
      // Check if email exists
      if (storage.getUserByEmail(formData.email)) {
        alert('A user with this email already exists');
        return;
      }

      // Create new user
      const newUser: User = {
        id: generateId('usr'),
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: 'organizer',
        createdAt: new Date().toISOString(),
      };
      storage.createUser(newUser);

      // Create new organizer
      const newOrganizer: Organizer = {
        id: generateId('org'),
        userId: newUser.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        assignedEvents: [],
        status: formData.status,
        createdAt: new Date().toISOString(),
      };
      storage.createOrganizer(newOrganizer);
      setOrganizers(storage.getOrganizers());
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (organizerId: string) => {
    const organizer = storage.getOrganizerById(organizerId);
    if (organizer) {
      // Delete user
      storage.deleteUser(organizer.userId);
      // Delete organizer
      storage.deleteOrganizer(organizerId);
      setOrganizers(storage.getOrganizers());
    }
    setDeleteConfirmId(null);
  };

  const getAssignedEventNames = (eventIds: string[]) => {
    return eventIds
      .map((id) => storage.getEventById(id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Organizers</h1>
            <p className="text-muted-foreground mt-1">Manage event organizers and their assignments</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary">
            <Plus size={20} />
            Add Organizer
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search organizers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrganizerStatus | 'all')}
            className="input-field w-full sm:w-48"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Organizers Table */}
        {filteredOrganizers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No organizers found"
            description={searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first organizer to get started'}
            action={!searchQuery && statusFilter === 'all' ? { label: 'Add Organizer', onClick: openCreateModal } : undefined}
          />
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr className="bg-muted/50">
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Assigned Events</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrganizers.map((organizer) => (
                    <tr key={organizer.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {organizer.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground">{organizer.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail size={14} />
                            <span>{organizer.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone size={14} />
                            <span>{organizer.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-muted-foreground" />
                          <span className="text-sm text-foreground">
                            {organizer.assignedEvents.length > 0
                              ? `${organizer.assignedEvents.length} event(s)`
                              : 'No events'}
                          </span>
                        </div>
                        {organizer.assignedEvents.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                            {getAssignedEventNames(organizer.assignedEvents)}
                          </p>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={organizer.status} />
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(organizer)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(organizer.id)}
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
          title={editingOrganizer ? 'Edit Organizer' : 'Add Organizer'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="Enter email"
                required
                disabled={!!editingOrganizer}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="Enter phone number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {editingOrganizer ? 'New Password (leave blank to keep current)' : 'Password'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field"
                placeholder={editingOrganizer ? 'Enter new password' : 'Enter password'}
                required={!editingOrganizer}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as OrganizerStatus })}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
                {editingOrganizer ? 'Update Organizer' : 'Add Organizer'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Organizer"
          size="sm"
        >
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Are you sure you want to delete this organizer? This will also remove their user account.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)} className="btn-danger">
                Delete Organizer
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
