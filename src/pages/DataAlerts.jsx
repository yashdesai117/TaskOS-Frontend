import { useMemo, useState } from 'react';
import { generateDataTasks, ALERT_TYPE_META } from '../engines/dataTaskGenerator';
import { prioritizeTasks } from '../engines/prioritization';
import TaskCard from '../components/TaskCard';

export default function DataAlerts({ onAddToBoard }) {
  const [activeType, setActiveType] = useState('all');

  const all = useMemo(() => prioritizeTasks(generateDataTasks()), []);

  const grouped = useMemo(() => {
    const map = {};
    all.forEach(t => {
      const key = t.alertType || 'other';
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [all]);

  const types    = Object.keys(grouped);
  const displayed = activeType === 'all' ? all : (grouped[activeType] || []);

  return (
    <div style={{ width: '100%' }}>
      {/* Filter row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className={`fchip ${activeType === 'all' ? 'on' : ''}`} onClick={() => setActiveType('all')}>
          All Alerts &nbsp;<span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{all.length}</span>
        </button>
        {types.map(type => {
          const meta = ALERT_TYPE_META[type] || { label: type, icon: '⚠️', color: '#6B7280' };
          return (
            <button
              key={type}
              className={`fchip ${activeType === type ? 'on' : ''}`}
              style={activeType === type ? {} : { borderColor: meta.color + '50', color: meta.color }}
              onClick={() => setActiveType(type)}
            >
              {meta.icon} {meta.label} &nbsp;
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                {grouped[type].length}
              </span>
            </button>
          );
        })}
      </div>

      {/* AI Explainer */}
      <div style={{
        display: 'flex', gap: 14, alignItems: 'flex-start',
        background: 'var(--primary-bg)', border: '1px solid var(--primary-border)',
        borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: 22,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 'var(--radius-md)',
          background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85rem', flexShrink: 0,
        }}>🤖</div>
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-text)', marginBottom: 3 }}>
            {all.length} tasks auto-generated from your data
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--tx-secondary)', lineHeight: 1.6 }}>
            Scanned GCV3, GoLive Tracker, and Metabase · Rules: Potential Hits, Paused Accounts, High RTO, PnL Deterioration, GoLive Delays · All pre-enriched with seller context.
          </div>
        </div>
      </div>

      {/* Grouped or filtered */}
      {activeType === 'all' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
          gap: 20, alignItems: 'start',
        }}>
          {types.map(type => {
            const meta  = ALERT_TYPE_META[type] || { label: type, icon: '⚠️', color: '#6B7280', bg: '#F3F4F6' };
            const items = grouped[type];
            return (
              <div key={type}>
                <div className="alert-grp-hd" style={{
                  background: meta.bg, color: meta.color,
                  border: `1px solid ${meta.color}25`,
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{meta.icon}</span>
                  <span>{meta.label}</span>
                  <span style={{
                    marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.7rem', fontWeight: 700,
                    background: 'rgba(0,0,0,0.08)', padding: '1px 8px', borderRadius: 4,
                  }}>{items.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map((task, idx) => (
                    <TaskCard key={task.id} task={task} rank={idx} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
          gap: 10,
        }}>
          {displayed.map((task, idx) => (
            <TaskCard key={task.id} task={task} rank={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
