import { useMemo } from 'react';
import {
  LayoutDashboard, CheckSquare, Zap, Bell, BarChart3, ChevronRight
} from 'lucide-react';
import { dailyMetrics } from '../data/mockData';
import { generateDataTasks } from '../engines/dataTaskGenerator';

const NAV = [
  { id: 'command', label: 'Command Center', icon: LayoutDashboard },
  { id: 'tasks',   label: 'Task Board',      icon: CheckSquare },
  { id: 'sellers', label: 'Seller Intel',    icon: Zap },
  { id: 'alerts',  label: 'Data Alerts',     icon: Bell },
  { id: 'team',    label: 'Team',            icon: BarChart3 },
];

const PULSE = [
  { key: 'hits',      label: 'Hits',      color: '#8B5CF6' },
  { key: 'potentials',label: 'Potentials',color: '#D97706' },
  { key: 'live',      label: 'Live',      color: '#10B981' },
  { key: 'spending',  label: 'Spending',  color: '#0284C7' },
];

export default function Sidebar({ activePage, onNavigate }) {
  const alertCount = useMemo(() => generateDataTasks().length, []);
  const dm = dailyMetrics;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">TO</div>
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">Task OS</div>
          <div className="sidebar-brand-sub">ShopDeck · HITS</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section">Workspace</div>
        {NAV.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon className="nav-icon" size={14} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.id === 'alerts' && alertCount > 0 && (
                <span className="nav-badge">{alertCount}</span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Daily Pulse */}
      <div className="sidebar-pulse">
        <div className="sidebar-pulse-title">Today's Pulse</div>
        <div className="pulse-grid">
          {PULSE.map(p => (
            <div key={p.key} className="pulse-tile">
              <div className="pulse-value" style={{ color: p.color }}>
                {dm[p.key]}
              </div>
              <div className="pulse-label">{p.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* User */}
      <div className="sidebar-footer">
        <div className="user-pill">
          <div className="user-avatar">Y</div>
          <div className="user-pill-info">
            <div className="user-pill-name">Yash</div>
            <div className="user-pill-role">Growth Manager</div>
          </div>
          <ChevronRight size={13} style={{ color: 'var(--sidebar-text-dim)', flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}
