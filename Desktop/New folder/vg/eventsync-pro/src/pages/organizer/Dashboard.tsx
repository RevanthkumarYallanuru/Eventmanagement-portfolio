import React, { useState, useMemo } from 'react';
import { OrganizerLayout } from '@/components/layout/OrganizerLayout';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/storage';
import {
  Calendar,
  Users,
  UserCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  
  const organizerData = useMemo(() => {
    const organizer = storage.getOrganizerByUserId(user?.id || '');
    if (!organizer) return null;

    const assignedEvents = organizer.assignedEvents
      .map(eventId => storage.getEventById(eventId))
      .filter(Boolean)
      .filter(event => event!.status !== 'closed');

    const allGuests = assignedEvents.flatMap(event => 
      storage.getGuestsByEvent(event!.id)
    );

    const checkedInGuests = allGuests.filter(g => g.checkInStatus === 'checked_in');
    
    const recentCheckins = storage.getAttendanceByOrganizer(organizer.id)
      .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())
      .slice(0, 5)
      .map(record => ({
        ...record,
        guest: storage.getGuestById(record.guestId),
        event: storage.getEventById(record.eventId),
      }));

    return {
      organizer,
      assignedEvents,
      totalGuests: allGuests.length,
      checkedIn: checkedInGuests.length,
      recentCheckins,
    };
  }, [user]);

  if (!organizerData) {
    return (
      <OrganizerLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Unable to load organizer data.</p>
        </div>
      </OrganizerLayout>
    );
  }

  const { assignedEvents, totalGuests, checkedIn, recentCheckins } = organizerData;

  return (
    <OrganizerLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name}! Here's your event overview.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Assigned Events"
            value={assignedEvents.length}
            icon={Calendar}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
          <StatCard
            title="Total Guests"
            value={totalGuests}
            icon={Users}
            iconColor="text-warning"
            iconBgColor="bg-warning/10"
          />
          <StatCard
            title="Checked In"
            value={checkedIn}
            icon={UserCheck}
            iconColor="text-success"
            iconBgColor="bg-success/10"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/organizer/check-in"
              className="flex items-center gap-4 p-4 rounded-lg bg-success/5 border border-success/20 hover:bg-success/10 transition-colors"
            >
              <div className="p-3 rounded-lg bg-success/10">
                <UserCheck size={24} className="text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">Check-In Guests</p>
                <p className="text-sm text-muted-foreground">Scan QR or search manually</p>
              </div>
              <ArrowRight size={20} className="ml-auto text-muted-foreground" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned Events */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Your Events</h2>
            </div>
            <div className="divide-y divide-border">
              {assignedEvents.length === 0 ? (
                <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                  No events assigned yet.
                </div>
              ) : (
                assignedEvents.map((event) => {
                  const eventGuests = storage.getGuestsByEvent(event!.id);
                  const eventCheckedIn = eventGuests.filter(g => g.checkInStatus === 'checked_in').length;
                  
                  return (
                    <div key={event!.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{event!.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(event!.dates.start), 'MMM d, yyyy')} • {event!.venue.name}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-muted-foreground">
                              {eventCheckedIn} / {eventGuests.length} checked in
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={event!.status} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Check-ins */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Recent Check-ins</h2>
            </div>
            <div className="divide-y divide-border">
              {recentCheckins.length === 0 ? (
                <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                  No recent check-ins.
                </div>
              ) : (
                recentCheckins.map((record) => (
                  <div key={record.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                          <UserCheck size={18} className="text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{record.guest?.name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{record.event?.name || 'Unknown Event'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock size={14} />
                        <span>{format(new Date(record.checkInTime), 'HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
}
