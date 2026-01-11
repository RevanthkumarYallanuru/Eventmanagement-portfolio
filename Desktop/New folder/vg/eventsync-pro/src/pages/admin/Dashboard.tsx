import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { storage } from '@/lib/storage';
import {
  Calendar,
  Users,
  UserCheck,
  DollarSign,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const stats = useMemo(() => {
    const events = storage.getEvents();
    const guests = storage.getGuests();
    const organizers = storage.getOrganizers();
    const financials = storage.getFinancials();

    const totalEvents = events.length;
    const liveEvents = events.filter(e => e.status === 'live').length;
    const totalGuests = guests.length;
    const checkedInGuests = guests.filter(g => g.checkInStatus === 'checked_in').length;
    const activeOrganizers = organizers.filter(o => o.status === 'active').length;
    
    const totalIncome = financials.reduce((sum, f) => sum + f.totalIncome, 0);
    const totalExpense = financials.reduce((sum, f) => sum + f.totalExpense, 0);
    const profit = totalIncome - totalExpense;

    return {
      totalEvents,
      liveEvents,
      totalGuests,
      checkedInGuests,
      activeOrganizers,
      totalIncome,
      profit,
    };
  }, []);

  const recentEvents = useMemo(() => {
    return storage.getEvents()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, []);

  const recentCheckins = useMemo(() => {
    const attendance = storage.getAttendance()
      .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())
      .slice(0, 5);

    return attendance.map(record => {
      const guest = storage.getGuestById(record.guestId);
      const event = storage.getEventById(record.eventId);
      return { ...record, guest, event };
    });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your events.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            icon={Calendar}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
          <StatCard
            title="Live Events"
            value={stats.liveEvents}
            icon={TrendingUp}
            iconColor="text-success"
            iconBgColor="bg-success/10"
          />
          <StatCard
            title="Total Guests"
            value={stats.totalGuests}
            icon={UserCheck}
            iconColor="text-warning"
            iconBgColor="bg-warning/10"
          />
          <StatCard
            title="Active Organizers"
            value={stats.activeOrganizers}
            icon={Users}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-success/10">
                <DollarSign size={20} className="text-success" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Total Income</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${stats.totalIncome.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-destructive/10">
                <DollarSign size={20} className="text-destructive" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Total Expenses</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${(stats.totalIncome - stats.profit).toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp size={20} className="text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Net Profit</span>
            </div>
            <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${stats.profit.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Events */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Recent Events</h2>
              <Link to="/admin/events" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentEvents.length === 0 ? (
                <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                  No events yet. Create your first event!
                </div>
              ) : (
                recentEvents.map((event) => (
                  <div key={event.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{event.name}</p>
                        <p className="text-sm text-muted-foreground">{event.venue.name}</p>
                      </div>
                      <StatusBadge status={event.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Check-ins */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Recent Check-ins</h2>
              <Link to="/admin/guests" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentCheckins.length === 0 ? (
                <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                  No check-ins yet.
                </div>
              ) : (
                recentCheckins.map((record) => (
                  <div key={record.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{record.guest?.name || 'Unknown Guest'}</p>
                        <p className="text-sm text-muted-foreground">{record.event?.name || 'Unknown Event'}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(record.checkInTime), 'MMM d, HH:mm')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
