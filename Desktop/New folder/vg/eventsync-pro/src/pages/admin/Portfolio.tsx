import React, { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { storage, PortfolioEvent } from '@/lib/storage';
import { generateId } from '@/lib/utils/id';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image,
  Video,
  Link,
  X,
  Upload,
  Trash,
} from 'lucide-react';
import { format, parse } from 'date-fns';

export default function AdminPortfolio() {
  const [events, setEvents] = useState<PortfolioEvent[]>(() => storage.getPortfolioEvents());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PortfolioEvent | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'wedding',
    date: '',
    location: '',
    coverImage: '',
    images: [] as string[],
    videos: [] as string[],
    highlights: [] as string[],
    guestCount: 0,
    featured: false,
  });

  const [newHighlight, setNewHighlight] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const categories = [
    'wedding',
    'corporate',
    'birthday',
    'anniversary',
    'conference',
    'festival',
    'other',
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, categoryFilter]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'wedding',
      date: '',
      location: '',
      coverImage: '',
      images: [],
      videos: [],
      highlights: [],
      guestCount: 0,
      featured: false,
    });
    setNewHighlight('');
    setNewImageUrl('');
    setNewVideoUrl('');
    setEditingEvent(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (event: PortfolioEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date,
      location: event.location,
      coverImage: event.coverImage,
      images: [...event.images],
      videos: [...event.videos],
      highlights: [...event.highlights],
      guestCount: event.guestCount || 0,
      featured: event.featured,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImage' | 'images') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (field === 'coverImage') {
          setFormData(prev => ({ ...prev, coverImage: base64 }));
        } else if (field === 'images') {
          setFormData(prev => ({ ...prev, images: [...prev.images, base64] }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({ ...prev, images: [...prev.images, newImageUrl.trim()] }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const addVideo = () => {
    if (newVideoUrl.trim()) {
      setFormData(prev => ({ ...prev, videos: [...prev.videos, newVideoUrl.trim()] }));
      setNewVideoUrl('');
    }
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({ ...prev, videos: prev.videos.filter((_, i) => i !== index) }));
  };

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setFormData(prev => ({ ...prev, highlights: [...prev.highlights, newHighlight.trim()] }));
      setNewHighlight('');
    }
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEvent) {
      const updated = storage.updatePortfolioEvent(editingEvent.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: formData.date,
        location: formData.location,
        coverImage: formData.coverImage,
        images: formData.images,
        videos: formData.videos,
        highlights: formData.highlights,
        guestCount: formData.guestCount,
        featured: formData.featured,
      });
      setEvents(storage.getPortfolioEvents());
    } else {
      storage.addPortfolioEvent({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: formData.date,
        location: formData.location,
        coverImage: formData.coverImage,
        images: formData.images,
        videos: formData.videos,
        highlights: formData.highlights,
        guestCount: formData.guestCount,
        featured: formData.featured,
      });
      setEvents(storage.getPortfolioEvents());
    }

    resetForm();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    storage.deletePortfolioEvent(id);
    setEvents(storage.getPortfolioEvents());
    setDeleteConfirmId(null);
  };

  const toggleFeatured = (id: string) => {
    const event = events.find(e => e.id === id);
    if (event) {
      storage.updatePortfolioEvent(id, { featured: !event.featured });
      setEvents(storage.getPortfolioEvents());
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Portfolio Events</h1>
              <p className="text-muted-foreground mt-1">Manage your event portfolio and showcase</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Event
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <EmptyState
            icon={Image}
            title="No portfolio events yet"
            description="Create your first portfolio event to showcase your work"
            action={{
              label: 'Create Event',
              onClick: openCreateModal,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="group relative rounded-lg border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-muted">
                  {event.coverImage ? (
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                  {event.featured && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded bg-yellow-500 text-white text-xs font-medium">
                      Featured
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4 text-xs text-muted-foreground">
                    <span className="px-2 py-1 rounded bg-primary/10 text-primary">
                      {event.category}
                    </span>
                    {event.guestCount > 0 && (
                      <span className="px-2 py-1 rounded bg-muted">
                        {event.guestCount} guests
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Image className="w-4 h-4" />
                      {event.images.length}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Video className="w-4 h-4" />
                      {event.videos.length}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Link className="w-4 h-4" />
                      {event.highlights.length}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(event)}
                      className="flex-1 px-3 py-2 rounded border border-border text-sm font-medium text-foreground hover:bg-muted transition-all"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => toggleFeatured(event.id)}
                      className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                        event.featured
                          ? 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/50'
                          : 'border border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      {event.featured ? '★' : '☆'}
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(event.id)}
                      className="flex-1 px-3 py-2 rounded border border-destructive/50 text-destructive text-sm font-medium hover:bg-destructive/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              resetForm();
            }}
            title={editingEvent ? 'Edit Portfolio Event' : 'Create Portfolio Event'}
          >
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Wedding at Hilton..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                    placeholder="Describe the event..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="City, venue..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Guest Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.guestCount}
                      onChange={(e) => setFormData(prev => ({ ...prev, guestCount: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cover Image
                </label>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary transition-all">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'coverImage')}
                      className="hidden"
                    />
                  </label>
                </div>
                {formData.coverImage && (
                  <div className="mt-2 relative h-32 rounded-lg overflow-hidden border border-border">
                    <img
                      src={formData.coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                      className="absolute top-2 right-2 p-1 rounded bg-destructive text-white hover:bg-destructive/90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Gallery Images
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Image URL or upload..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <label className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 cursor-pointer transition-all">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'images')}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={addImage}
                      className="px-4 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-all"
                    >
                      Add
                    </button>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Gallery ${idx}`}
                            className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-75"
                            onClick={() => setPreviewImage(img)}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Videos */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Video Links (YouTube, Vimeo, etc.)
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Video URL..."
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={addVideo}
                      className="px-4 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-all"
                    >
                      Add
                    </button>
                  </div>

                  {formData.videos.length > 0 && (
                    <div className="space-y-2">
                      {formData.videos.map((video, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded border border-border bg-muted">
                          <Video className="w-4 h-4 text-primary" />
                          <span className="flex-1 text-sm truncate">{video}</span>
                          <button
                            type="button"
                            onClick={() => removeVideo(idx)}
                            className="p-1 text-destructive hover:bg-destructive/10 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Blog Links & Highlights
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add highlight or blog link..."
                      value={newHighlight}
                      onChange={(e) => setNewHighlight(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={addHighlight}
                      className="px-4 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-all"
                    >
                      Add
                    </button>
                  </div>

                  {formData.highlights.length > 0 && (
                    <div className="space-y-2">
                      {formData.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded border border-border bg-muted">
                          <Link className="w-4 h-4 text-primary" />
                          <span className="flex-1 text-sm truncate">{highlight}</span>
                          <button
                            type="button"
                            onClick={() => removeHighlight(idx)}
                            className="p-1 text-destructive hover:bg-destructive/10 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Featured */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 rounded border border-border"
                />
                <label htmlFor="featured" className="text-sm font-medium text-foreground cursor-pointer">
                  Featured Event
                </label>
              </div>

              {/* Submit */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Delete Confirmation */}
        {deleteConfirmId && (
          <Modal
            isOpen={true}
            onClose={() => setDeleteConfirmId(null)}
            title="Delete Portfolio Event"
          >
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete this portfolio event? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Image Preview */}
        {previewImage && (
          <Modal
            isOpen={true}
            onClose={() => setPreviewImage(null)}
            title="Image Preview"
          >
            <img src={previewImage} alt="Preview" className="w-full rounded-lg" />
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}
