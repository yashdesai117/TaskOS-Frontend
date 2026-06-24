import { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { prioritizeTasks } from '../engines/prioritization';
import { enrichTask } from '../engines/contextEnricher';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';

const FILTERS = [
  { id: 'all',     label: 'All' },
  { id: 'urgent',  label: 'Urgent' },
  { id: 'today',   label: 'Today' },
  { id: 'manager', label: 'From Manager' },
  { id: 'system',  label: 'Data Alerts' },
  { id: 'seller',  label: 'Has Seller' },
];

export default function TaskBoard({ tasks, onAdd, onComplete }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setModal] = useState(false);

  const sorted = useMemo(() => {
    let list = tasks.map(enrichTask);
    if (filter === 'urgent')  list = list.filter(t => t.urgency === 'urgent');
    if (filter === 'today')   list = list.filter(t => t.urgency === 'today');
    if (filter === 'manager') list = list.filter(t => t.source === 'manager');
    if (filter === 'system')  list = list.filter(t => t.source === 'system');
    if (filter === 'seller')  list = list.filter(t => !!t.sellerName);
    if (search) list = list.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.sellerName || '').toLowerCase().includes(search.toLowerCase())
    );
    return prioritizeTasks(list);
  }, [tasks, filter, search]);

  return (
    <div style={{ width: '100%' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div className="search-wrap">
          <Search size={13} />
          <input
            className="search-input"
            placeholder="Search tasks or sellers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`fchip ${filter === f.id ? 'on' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--tx-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
            {sorted.length} tasks
          </span>
          <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>
            <Plus size={14} /> Capture Task
          </button>
        </div>
      </div>

      {/* Two-column grid at large viewports */}
      {sorted.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty-icon">✅</div>
            <div className="empty-title">All clear</div>
            <div className="empty-sub">No tasks match this filter.</div>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(520px, 1fr))',
          gap: 10,
        }}>
          {sorted.map((task, idx) => (
            <TaskCard key={task.id} task={task} rank={idx} onComplete={onComplete} />
          ))}
        </div>
      )}

      {showModal && <AddTaskModal onClose={() => setModal(false)} onAdd={onAdd} />}
    </div>
  );
}
