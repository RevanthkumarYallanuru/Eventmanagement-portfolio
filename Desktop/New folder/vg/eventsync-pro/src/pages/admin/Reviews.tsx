import React, { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { storage, Testimonial } from '@/lib/storage';
import { generateId } from '@/lib/utils/id';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  MessageSquare,
} from 'lucide-react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Testimonial[]>(() => storage.getTestimonials());
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Testimonial | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    clientName: '',
    clientTitle: '',
    clientImage: '',
    content: '',
    rating: 5,
  });

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesSearch =
        review.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating = ratingFilter === 'all' || review.rating === ratingFilter;
      return matchesSearch && matchesRating;
    });
  }, [reviews, searchQuery, ratingFilter]);

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientTitle: '',
      clientImage: '',
      content: '',
      rating: 5,
    });
    setEditingReview(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (review: Testimonial) => {
    setEditingReview(review);
    setFormData({
      clientName: review.clientName,
      clientTitle: review.clientTitle,
      clientImage: review.clientImage || '',
      content: review.content,
      rating: review.rating,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData(prev => ({ ...prev, clientImage: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingReview) {
      storage.updateTestimonial(editingReview.id, {
        clientName: formData.clientName,
        clientTitle: formData.clientTitle,
        clientImage: formData.clientImage,
        content: formData.content,
        rating: formData.rating,
      });
    } else {
      storage.addTestimonial({
        clientName: formData.clientName,
        clientTitle: formData.clientTitle,
        clientImage: formData.clientImage,
        content: formData.content,
        rating: formData.rating,
      });
    }

    setReviews(storage.getTestimonials());
    resetForm();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    storage.deleteTestimonial(id);
    setReviews(storage.getTestimonials());
    setDeleteConfirmId(null);
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Customer Reviews</h1>
              <p className="text-muted-foreground mt-1">Manage and showcase customer testimonials</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Review
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {/* Reviews Grid */}
        {filteredReviews.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No reviews yet"
            description="Add your first customer review to showcase your work"
            action={{
              label: 'Add Review',
              onClick: openCreateModal,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="group relative rounded-lg border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>

                {/* Review Content */}
                <p className="text-muted-foreground mb-6 line-clamp-3">"{review.content}"</p>

                {/* Client Info */}
                <div className="flex items-start gap-3 mb-4 pb-4 border-b border-border">
                  {review.clientImage ? (
                    <img
                      src={review.clientImage}
                      alt={review.clientName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold">
                      {review.clientName.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{review.clientName}</p>
                    <p className="text-xs text-muted-foreground truncate">{review.clientTitle}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(review)}
                    className="flex-1 px-3 py-2 rounded border border-border text-sm font-medium text-foreground hover:bg-muted transition-all"
                  >
                    <Edit className="w-4 h-4 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(review.id)}
                    className="flex-1 px-3 py-2 rounded border border-destructive/50 text-destructive text-sm font-medium hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
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
            title={editingReview ? 'Edit Review' : 'Add New Review'}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="John Doe"
                />
              </div>

              {/* Client Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title/Position
                </label>
                <input
                  type="text"
                  value={formData.clientTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientTitle: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Bride & Groom / CEO / Event Organizer"
                />
              </div>

              {/* Client Image */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Client Photo
                </label>
                <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary transition-all">
                  <span className="text-sm text-muted-foreground">Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {formData.clientImage && (
                  <div className="mt-3 w-20 h-20 rounded-full overflow-hidden border border-border">
                    <img
                      src={formData.clientImage}
                      alt="Client"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= formData.rating
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Content */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Review Content *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={5}
                  placeholder="Write the review..."
                />
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
                  {editingReview ? 'Update Review' : 'Add Review'}
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
            title="Delete Review"
          >
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete this review? This action cannot be undone.
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
      </div>
    </AdminLayout>
  );
}
