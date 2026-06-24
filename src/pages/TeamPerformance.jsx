import { useMemo } from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell, XAxis } from 'recharts';
import { GCS, goLiveTracker, gcv3, hitsTracker, dailyMetrics } from '../data/mockData';

// All GC colors are now monochromatic shades of Primary (Indigo) except for semantic accents if needed
// Or just let them all be shades of Primary
const GC_COLORS = ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC'];

function Bar_(props) { return <rect {...props} rx={3} ry={3} />; }

function KpiBar({ value, max = 100, color }) {
  return (
    <div className="kpi-bar-track">
      <div className="kpi-bar-fill" style={{ width: `${Math.min(100, value)}%`, background: color }} />
    </div>
  );
}

export default function TeamPerformance() {
  const gcStats = useMemo(() => GCS.map((gc, idx) => {
    const assigned = gc.assignedCount;
    const live     = goLiveTracker.filter(s => s.gc === gc.name && s.isLive).length;
    const spending = gcv3.filter(s => {
      const r = goLiveTracker.find(l => l.sellerName === s.sellerName);
      return r?.gc === gc.name && s.weeks.at(-1).spend > 0;
    }).length;
    const hits = hitsTracker.filter(h => {
      const r = goLiveTracker.find(l => l.sellerName === h.sellerName);
      return r?.gc === gc.name && h.isHit;
    }).length;

    return {
      ...gc,
      live, spending, hits,
      liveRate:  assigned > 0 ? +((live / assigned) * 100).toFixed(1) : 0,
      spendRate: live > 0    ? +((spending / live) * 100).toFixed(1) : 0,
      color: GC_COLORS[idx],
    };
  }), []);

  const totals = useMemo(() => ({
    assigned: GCS.reduce((s, g) => s + g.assignedCount, 0),
    live:     goLiveTracker.filter(s => s.isLive).length,
    hits:     hitsTracker.filter(h => h.isHit).length,
    spending: gcv3.filter(s => s.weeks.at(-1).spend > 0).length,
  }), []);

  const chartData = gcStats.map(gc => ({
    name: gc.name,
    live: gc.liveRate,
    spend: gc.spendRate,
    color: gc.color,
  }));

  return (
    <div style={{ width: '100%' }}>
      {/* Team Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Assigned', value: totals.assigned, sub: '4 GCs',                                              color: 'var(--tx-secondary)' },
          { label: 'Total Live',     value: totals.live,     sub: `${((totals.live/totals.assigned)*100).toFixed(0)}% of assigned`, color: 'var(--success)' },
          { label: 'Spending Now',   value: totals.spending, sub: `${((totals.spending/totals.live)*100).toFixed(0)}% of live`,     color: 'var(--primary-mid)' },
          { label: 'Active Hits',    value: totals.hits,     sub: 'This month',                                          color: 'var(--warning-mid)' },
        ].map(m => (
          <div key={m.label} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '22px 24px', boxShadow: 'var(--shadow-xs)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: m.color }} />
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>{m.label}</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2.8rem', fontWeight: 800, color: m.color, letterSpacing: '-0.05em', lineHeight: 1 }}>{m.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--tx-muted)', marginTop: 8 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Comparative Chart + GC Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20 }}>
        {/* GC Comparison Chart */}
        <div className="card">
          <div className="card-hd">
            <span className="card-hd-title">GC KPI Comparison</span>
            <div style={{ display: 'flex', gap: 14 }}>
              {[{ label: 'Live Rate', color: 'var(--primary-mid)' }, { label: 'Spend Rate', color: 'var(--success)' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: 'var(--tx-secondary)' }}>
                  <span style={{ width: 8, height: 3, background: l.color, borderRadius: 2, display: 'inline-block' }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
          <div className="card-body" style={{ padding: '16px 18px 20px' }}>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="35%">
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600, fill: '#52525B' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#09090B', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff' }}
                    labelStyle={{ color: '#A1A1AA', fontWeight: 600 }}
                    formatter={(val, name) => [`${val}%`, name === 'live' ? 'Live Rate' : 'Spend Rate']}
                  />
                  <Bar dataKey="live"  shape={<Bar_ />} fill="var(--primary-mid)" radius={[4,4,0,0]} />
                  <Bar dataKey="spend" shape={<Bar_ />} fill="var(--success)"    radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* GC Performance Details */}
        <div className="card">
          <div className="card-hd"><span className="card-hd-title">GC Performance Details</span></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {gcStats.map((gc, i) => (
              <div key={gc.id} style={{
                padding: '12px 18px',
                borderBottom: i < gcStats.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-full)', background: gc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>{gc.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--tx-primary)' }}>{gc.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--tx-muted)', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                    Live {gc.liveRate}% · Spend {gc.spendRate}%
                  </div>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 800, color: gc.hits > 0 ? 'var(--primary-mid)' : 'var(--tx-muted)' }}>
                  {gc.hits} ⭐
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GC Cards — 4 columns */}
      <div className="section-hd" style={{ marginBottom: 14 }}>
        <div className="section-hd-title">Growth Consultant KPIs <span className="count-pill">4 GCs</span></div>
      </div>
      <div className="four-col">
        {gcStats.map((gc, idx) => (
          <div key={gc.id} className="gc-card">
            <div className="gc-card-top">
              <div className="gc-av" style={{ background: gc.color }}>{gc.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div className="gc-name">{gc.name}</div>
                <div className="gc-sub">{gc.assignedCount} sellers · {gc.hits} hit{gc.hits !== 1 ? 's' : ''}</div>
              </div>
              {gc.hits > 0 && (
                <span className="chip-hit" style={{ flexShrink: 0 }}>⭐ {gc.hits}</span>
              )}
            </div>
            <div className="gc-kpis">
              <div>
                <div className="kpi-row-hd">
                  <span className="kpi-row-label">Live / Assigned</span>
                  <span className="kpi-row-value">{gc.live}/{gc.assignedCount} · <span style={{ color: gc.color }}>{gc.liveRate}%</span></span>
                </div>
                <KpiBar value={gc.liveRate} color={gc.color} />
              </div>
              <div>
                <div className="kpi-row-hd">
                  <span className="kpi-row-label">Spending / Live</span>
                  <span className="kpi-row-value">{gc.spending}/{gc.live} · <span style={{ color: gc.color }}>{gc.spendRate}%</span></span>
                </div>
                <KpiBar value={gc.spendRate} color={gc.color} />
              </div>
              <div>
                <div className="kpi-row-hd">
                  <span className="kpi-row-label">Hits Converted</span>
                  <span className="kpi-row-value" style={{ color: gc.hits > 0 ? 'var(--primary-mid)' : 'var(--tx-muted)' }}>
                    {gc.hits}
                  </span>
                </div>
                <KpiBar value={(gc.hits / Math.max(1, gc.assignedCount)) * 500} color="var(--primary-mid)" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
