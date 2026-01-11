import React, { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { storage, Event, EventFinancials, ExpenseItem, IncomeItem } from '@/lib/storage';
import { generateId } from '@/lib/utils/id';
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminFinancials() {
  const [events] = useState<Event[]>(() => storage.getEvents());
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [financials, setFinancials] = useState<EventFinancials | null>(() =>
    selectedEventId ? storage.getFinancialsByEvent(selectedEventId) || null : null
  );
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [editingIncome, setEditingIncome] = useState<IncomeItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'expense' | 'income'; id: string } | null>(null);

  // Form state
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const [incomeForm, setIncomeForm] = useState({
    description: '',
    amount: '',
    source: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const selectedEvent = useMemo(() => events.find(e => e.id === selectedEventId), [events, selectedEventId]);

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    setFinancials(storage.getFinancialsByEvent(eventId) || null);
  };

  const getOrCreateFinancials = (): EventFinancials => {
    if (financials) return financials;
    const newFinancials: EventFinancials = {
      eventId: selectedEventId,
      expenses: [],
      income: [],
      totalExpense: 0,
      totalIncome: 0,
      profit: 0,
    };
    storage.createOrUpdateFinancials(newFinancials);
    setFinancials(newFinancials);
    return newFinancials;
  };

  const recalculateTotals = (fin: EventFinancials): EventFinancials => {
    const totalExpense = fin.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = fin.income.reduce((sum, i) => sum + i.amount, 0);
    return {
      ...fin,
      totalExpense,
      totalIncome,
      profit: totalIncome - totalExpense,
    };
  };

  // Expense handlers
  const openExpenseModal = (expense?: ExpenseItem) => {
    if (expense) {
      setEditingExpense(expense);
      setExpenseForm({
        description: expense.description,
        amount: expense.amount.toString(),
        category: expense.category,
        date: expense.date.split('T')[0],
      });
    } else {
      setEditingExpense(null);
      setExpenseForm({
        description: '',
        amount: '',
        category: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
    setIsExpenseModalOpen(true);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let fin = getOrCreateFinancials();

    if (editingExpense) {
      fin = {
        ...fin,
        expenses: fin.expenses.map(exp =>
          exp.id === editingExpense.id
            ? {
                ...exp,
                description: expenseForm.description,
                amount: parseFloat(expenseForm.amount),
                category: expenseForm.category,
                date: new Date(expenseForm.date).toISOString(),
              }
            : exp
        ),
      };
    } else {
      const newExpense: ExpenseItem = {
        id: generateId('exp'),
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        date: new Date(expenseForm.date).toISOString(),
      };
      fin = {
        ...fin,
        expenses: [...fin.expenses, newExpense],
      };
    }

    fin = recalculateTotals(fin);
    storage.createOrUpdateFinancials(fin);
    setFinancials(fin);
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  // Income handlers
  const openIncomeModal = (income?: IncomeItem) => {
    if (income) {
      setEditingIncome(income);
      setIncomeForm({
        description: income.description,
        amount: income.amount.toString(),
        source: income.source,
        date: income.date.split('T')[0],
      });
    } else {
      setEditingIncome(null);
      setIncomeForm({
        description: '',
        amount: '',
        source: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
    setIsIncomeModalOpen(true);
  };

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let fin = getOrCreateFinancials();

    if (editingIncome) {
      fin = {
        ...fin,
        income: fin.income.map(inc =>
          inc.id === editingIncome.id
            ? {
                ...inc,
                description: incomeForm.description,
                amount: parseFloat(incomeForm.amount),
                source: incomeForm.source,
                date: new Date(incomeForm.date).toISOString(),
              }
            : inc
        ),
      };
    } else {
      const newIncome: IncomeItem = {
        id: generateId('inc'),
        description: incomeForm.description,
        amount: parseFloat(incomeForm.amount),
        source: incomeForm.source,
        date: new Date(incomeForm.date).toISOString(),
      };
      fin = {
        ...fin,
        income: [...fin.income, newIncome],
      };
    }

    fin = recalculateTotals(fin);
    storage.createOrUpdateFinancials(fin);
    setFinancials(fin);
    setIsIncomeModalOpen(false);
    setEditingIncome(null);
  };

  // Delete handlers
  const handleDelete = () => {
    if (!deleteConfirm || !financials) return;

    let fin: EventFinancials;
    if (deleteConfirm.type === 'expense') {
      fin = {
        ...financials,
        expenses: financials.expenses.filter(e => e.id !== deleteConfirm.id),
      };
    } else {
      fin = {
        ...financials,
        income: financials.income.filter(i => i.id !== deleteConfirm.id),
      };
    }

    fin = recalculateTotals(fin);
    storage.createOrUpdateFinancials(fin);
    setFinancials(fin);
    setDeleteConfirm(null);
  };

  const exportReport = () => {
    if (!financials) return;

    const lines = [
      `Financial Report - ${selectedEvent?.name || 'Unknown Event'}`,
      `Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
      '',
      'EXPENSES',
      'Description,Category,Amount,Date',
      ...financials.expenses.map(e => `${e.description},${e.category},$${e.amount},${format(new Date(e.date), 'yyyy-MM-dd')}`),
      '',
      'INCOME',
      'Description,Source,Amount,Date',
      ...financials.income.map(i => `${i.description},${i.source},$${i.amount},${format(new Date(i.date), 'yyyy-MM-dd')}`),
      '',
      'SUMMARY',
      `Total Income,$${financials.totalIncome}`,
      `Total Expenses,$${financials.totalExpense}`,
      `Net Profit,$${financials.profit}`,
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${selectedEvent?.name || 'event'}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isEventClosed = selectedEvent?.status === 'closed';

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Financials</h1>
            <p className="text-muted-foreground mt-1">Track event expenses and income</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedEventId}
              onChange={(e) => handleEventChange(e.target.value)}
              className="input-field w-full sm:w-56"
            >
              {events.length === 0 && <option value="">No events</option>}
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
            {financials && (
              <button onClick={exportReport} className="btn-secondary">
                <Download size={20} />
                Export
              </button>
            )}
          </div>
        </div>

        {events.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No events available"
            description="Create an event first to manage its financials"
          />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="stat-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-success/10">
                    <TrendingUp size={20} className="text-success" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Total Income</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${(financials?.totalIncome || 0).toLocaleString()}
                </p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <TrendingDown size={20} className="text-destructive" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Total Expenses</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${(financials?.totalExpense || 0).toLocaleString()}
                </p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <DollarSign size={20} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Net Profit</span>
                </div>
                <p className={`text-2xl font-bold ${(financials?.profit || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ${(financials?.profit || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Expenses & Income Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expenses */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h2 className="font-semibold text-foreground flex items-center gap-2">
                    <TrendingDown size={18} className="text-destructive" />
                    Expenses
                  </h2>
                  {!isEventClosed && (
                    <button onClick={() => openExpenseModal()} className="btn-secondary text-sm py-2 px-3">
                      <Plus size={16} />
                      Add
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-thin">
                  {!financials?.expenses?.length ? (
                    <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                      No expenses recorded
                    </div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr className="bg-muted/50">
                          <th>Description</th>
                          <th>Category</th>
                          <th>Amount</th>
                          <th>Date</th>
                          {!isEventClosed && <th></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {financials.expenses.map((expense) => (
                          <tr key={expense.id}>
                            <td className="font-medium text-foreground">{expense.description}</td>
                            <td className="text-muted-foreground">{expense.category}</td>
                            <td className="text-destructive font-medium">${expense.amount.toLocaleString()}</td>
                            <td className="text-muted-foreground">{format(new Date(expense.date), 'MMM d')}</td>
                            {!isEventClosed && (
                              <td>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => openExpenseModal(expense)}
                                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm({ type: 'expense', id: expense.id })}
                                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Income */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h2 className="font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp size={18} className="text-success" />
                    Income
                  </h2>
                  {!isEventClosed && (
                    <button onClick={() => openIncomeModal()} className="btn-secondary text-sm py-2 px-3">
                      <Plus size={16} />
                      Add
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-thin">
                  {!financials?.income?.length ? (
                    <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                      No income recorded
                    </div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr className="bg-muted/50">
                          <th>Description</th>
                          <th>Source</th>
                          <th>Amount</th>
                          <th>Date</th>
                          {!isEventClosed && <th></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {financials.income.map((income) => (
                          <tr key={income.id}>
                            <td className="font-medium text-foreground">{income.description}</td>
                            <td className="text-muted-foreground">{income.source}</td>
                            <td className="text-success font-medium">${income.amount.toLocaleString()}</td>
                            <td className="text-muted-foreground">{format(new Date(income.date), 'MMM d')}</td>
                            {!isEventClosed && (
                              <td>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => openIncomeModal(income)}
                                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm({ type: 'income', id: income.id })}
                                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Expense Modal */}
        <Modal
          isOpen={isExpenseModalOpen}
          onClose={() => {
            setIsExpenseModalOpen(false);
            setEditingExpense(null);
          }}
          title={editingExpense ? 'Edit Expense' : 'Add Expense'}
          size="sm"
        >
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <input
                type="text"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="input-field"
                placeholder="e.g., Venue rental"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <input
                type="text"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="input-field"
                placeholder="e.g., Venue, Catering"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="input-field"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Date</label>
              <input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingExpense ? 'Update' : 'Add'} Expense
              </button>
            </div>
          </form>
        </Modal>

        {/* Income Modal */}
        <Modal
          isOpen={isIncomeModalOpen}
          onClose={() => {
            setIsIncomeModalOpen(false);
            setEditingIncome(null);
          }}
          title={editingIncome ? 'Edit Income' : 'Add Income'}
          size="sm"
        >
          <form onSubmit={handleIncomeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <input
                type="text"
                value={incomeForm.description}
                onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                className="input-field"
                placeholder="e.g., Ticket sales"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Source</label>
              <input
                type="text"
                value={incomeForm.source}
                onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
                className="input-field"
                placeholder="e.g., Online sales, Sponsorship"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={incomeForm.amount}
                onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                className="input-field"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Date</label>
              <input
                type="date"
                value={incomeForm.date}
                onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <button type="button" onClick={() => setIsIncomeModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingIncome ? 'Update' : 'Add'} Income
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title={`Delete ${deleteConfirm?.type === 'expense' ? 'Expense' : 'Income'}`}
          size="sm"
        >
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Are you sure you want to delete this {deleteConfirm?.type}?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-danger">
                Delete
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
