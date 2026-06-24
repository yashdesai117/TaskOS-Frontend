import { useMemo } from 'react';
import { Target, Zap, TrendingUp, Users, BarChart2, ArrowRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { dailyMetrics, gcv3, metabase, goLiveTracker, pausedSellers } from '../data/mockData';
import { prioritizeTasks } from '../engines/prioritization';
import { enrichTask, enrichSellerContext } from '../engines/contextEnricher';
import TaskCard from '../components/TaskCard';

const NOW     = new Date();
const HOUR    = NOW.getHours();
const GREETING = HOUR < 12 ? 'Good morning' : HOUR < 17 ? 'Good afternoon' : 'Good evening';
const DATE_STR = NOW.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

// Aggregate spend trend across all sellers
const SPEND_TREND = ['W1','W2','W3','W4'].map(w => ({
  week: w,
  spend: gcv3.reduce((s, sel) => {
    const wk = sel.weeks.find(x => x.week === w);
    return s + (wk?.spend || 0);
  }, 0) / 1000,
}));

// Watchlist: paused accounts + near-hit accounts
function buildWatchlist() {
  const paused = gcv3
    .filter(s => pausedSellers.includes(s.sellerId))
    .map(s => ({
      ...enrichSellerContext(s.sellerId, s.sellerName),
      alertType: 'paused',
    }));

  const potentials = gcv3
    .filter(s => {
      const last2 = s.weeks.slice(-2);
      return last2.length === 2 && last2.every(w => w.pnl > 5) && last2.at(-1).spend > 3500 && s.pq > 2.8;
    })
    .slice(0, 4)
    .map(s => ({
      ...enrichSellerContext(s.sellerId, s.sellerName),
      alertType: 'potential',
    }));

  return { paused, potentials };
}

const KPI_META = [
  { key: 'hits',      label: 'Active Hits',    icon: Target,    color: '#4F46E5', cls: 'primary', change: '+3 WoW', dir: 'up' },
  { key: 'potentials',label: 'Potentials',     icon: TrendingUp,color: '#D97706', cls: 'warning',  sub: 'Ready to convert' },
  { key: 'live',      label: 'Live',           icon: Zap,       color: '#059669', cls: 'success', sub: k => `${dailyMetrics.liveByAssigned}% of assigned` },
  { key: 'spending',  label: 'Spending',       icon: BarChart2, color: '#D97706', cls: 'warning',  sub: k => `${dailyMetrics.spendByLive}% of live` },
  { key: 'assigned',  label: 'Assigned',       icon: Users,     color: '#A1A1AA', cls: 'muted',  sub: '4 GCs' },
];

export default function CommandCenter({ tasks, onComplete, onNavigate }) {
  const top5 = useMemo(() => prioritizeTasks(tasks.map(enrichTask)).slice(0, 5), [tasks]);
  const watchlist = useMemo(() => buildWatchlist(), []);
  const dm = dailyMetrics;

  return (
    <div style={{ width: '100%' }}>
      {/* Command Banner */}
      <div className="command-banner">
        <div className="banner-left">
          <div className="banner-greeting">{GREETING} · {DATE_STR}</div>
          <div className="banner-question">What should I do right now?</div>
          <div className="banner-sub">
            Monitoring <strong style={{ color: 'var(--tx-primary)' }}>{dm.assigned}</strong> accounts across 4 GCs · Updated just now
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
          {/* Spend Trend Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--tx-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Team Spend Trend</div>
            <div style={{ width: 130, height: 44 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SPEND_TREND} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="spend" stroke="#4F46E5" strokeWidth={2} fill="url(#spendGrad)" dot={false} />
                  <Tooltip content={({ active, payload }) => active && payload?.length
                    ? <div style={{ background: '#09090B', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>₹{payload[0].value.toFixed(0)}K</div>
                    : null} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--primary)' }}>
              ₹{(SPEND_TREND.at(-1)?.spend ?? 0).toFixed(0)}K / week
            </div>
          </div>

          <div style={{ width: 1, height: 56, background: 'var(--border)' }} />

          {/* Key stat group */}
          <div className="banner-stats">
            {[
              { label: 'Hit Rate',    value: `${((dm.hits / dm.assigned) * 100).toFixed(1)}%` },
              { label: 'Hits',        value: dm.hits },
              { label: 'Potentials',  value: dm.potentials },
            ].map(s => (
              <div key={s.label} className="banner-stat">
                <div className="banner-stat-value">{s.value}</div>
                <div className="banner-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Grid — 5 columns */}
      <div className="kpi-grid">
        {KPI_META.map(k => {
          const Icon = k.icon;
          const val  = dm[k.key];
          const sub  = typeof k.sub === 'function' ? k.sub() : k.sub;
          return (
            <div key={k.key} className={`kpi-tile ${k.cls}`}>
              <div className="kpi-tile-label">
                {k.label}
                <div className="kpi-icon-box" style={{ background: k.color + '15' }}>
                  <Icon size={14} style={{ color: k.color }} />
                </div>
              </div>
              <div className="kpi-value">{val}</div>
              {sub && <div className="kpi-sub">{sub}</div>}
              {k.change && (
                <div className={`kpi-change ${k.dir}`}>
                  {k.dir === 'up' ? '↑' : '↓'} {k.change}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main — priorities + watchlist */}
      <div className="two-col-6040">
        {/* Priority Tasks */}
        <div>
          <div className="section-hd">
            <div className="section-hd-title">
              Top Priorities
              <span className="count-pill">{top5.length}</span>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary-mid)', fontSize: '0.74rem' }} onClick={() => onNavigate('tasks')}>
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {top5.map((task, idx) => (
              <TaskCard key={task.id} task={task} rank={idx} onComplete={onComplete} />
            ))}
          </div>
        </div>

        {/* Right — Watchlist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Paused Accounts */}
          <div className="card">
            <div className="card-hd">
              <span className="card-hd-title">⛔ Paused Accounts</span>
              <span className="chip-alert">{watchlist.paused.length} accounts</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {watchlist.paused.length === 0 ? (
                <div style={{ padding: '16px 18px', fontSize: '0.78rem', color: 'var(--tx-muted)', textAlign: 'center' }}>None paused today ✓</div>
              ) : watchlist.paused.map((s, i) => (
                <div key={s.sellerId} style={{
                  padding: '11px 18px',
                  borderBottom: i < watchlist.paused.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--tx-primary)' }}>{s.sellerName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--tx-muted)', marginTop: 2 }}>GC: {s.gc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', fontWeight: 700, color: 'var(--danger-mid)' }}>₹0</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--tx-muted)' }}>was spending</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Potential Hits */}
          <div className="card">
            <div className="card-hd">
              <span className="card-hd-title">🎯 Potential Hits</span>
              <span className="chip-potential">{watchlist.potentials.length} sellers</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {watchlist.potentials.map((s, i) => (
                <div key={s.sellerId} style={{
                  padding: '11px 18px',
                  borderBottom: i < watchlist.potentials.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--tx-primary)' }}>{s.sellerName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--tx-muted)', marginTop: 2 }}>GC: {s.gc} · PQ {s.pq}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)' }}>
                      +{s.latestPnl}%
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--tx-muted)' }}>₹{(s.latestSpend/1000).toFixed(1)}K spend</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Snapshot */}
          <div className="card">
            <div className="card-hd">
              <span className="card-hd-title">Team Snapshot</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Live / Assigned',   value: `${dm.live} / ${dm.assigned}`, pct: dm.liveByAssigned, color: 'var(--success)' },
                { label: 'Spending / Live',   value: `${dm.spending} / ${dm.live}`, pct: dm.spendByLive,    color: 'var(--primary-mid)' },
                { label: 'Hits / Assigned',   value: `${dm.hits} / ${dm.assigned}`, pct: ((dm.hits/dm.assigned)*100).toFixed(1), color: 'var(--warning-mid)' },
              ].map(m => (
                <div key={m.label}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--tx-secondary)' }}>{m.label}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.76rem', fontWeight: 700, color: m.color }}>{m.pct}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-subtle)', borderRadius: 99, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, m.pct)}%`, background: m.color, borderRadius: 99, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
