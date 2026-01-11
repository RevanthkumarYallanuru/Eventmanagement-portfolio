import React from 'react';
import { EventStatus, RsvpStatus, CheckInStatus, OrganizerStatus } from '@/lib/storage/types';

type StatusType = EventStatus | RsvpStatus | CheckInStatus | OrganizerStatus;

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  // Event statuses
  draft: { label: 'Draft', className: 'status-draft' },
  ready: { label: 'Ready', className: 'status-ready' },
  live: { label: 'Live', className: 'status-live' },
  closed: { label: 'Closed', className: 'status-closed' },
  
  // RSVP statuses
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning' },
  confirmed: { label: 'Confirmed', className: 'bg-success/10 text-success' },
  declined: { label: 'Declined', className: 'bg-destructive/10 text-destructive' },
  
  // Check-in statuses
  not_checked_in: { label: 'Not Checked In', className: 'bg-muted text-muted-foreground' },
  checked_in: { label: 'Checked In', className: 'bg-success/10 text-success' },
  checked_out: { label: 'Checked Out', className: 'bg-primary/10 text-primary' },
  
  // Organizer statuses
  active: { label: 'Active', className: 'bg-success/10 text-success' },
  inactive: { label: 'Inactive', className: 'bg-muted text-muted-foreground' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };
  
  return (
    <span
      className={`status-badge ${config.className} ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
    >
      {config.label}
    </span>
  );
}
