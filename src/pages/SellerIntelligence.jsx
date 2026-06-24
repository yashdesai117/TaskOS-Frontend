import { useState, useMemo } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
} from 'recharts';
import { gcv3, goLiveTracker, hitsTracker, metabase } from '../data/mockData';
import { pnlColor, formatINR } from '../utils/formatters';

function MiniChart({ weeks, color }) {
  const data = weeks.map(w => ({ week: w.week, pnl: w.pnl }));
  return (
    <div style={{ width: 80, height: 28 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`g-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="pnl" stroke={color} strokeWidth={1.5}
            fill={`url(#g-${color.replace('#','')})`} dot={false} />
          <Tooltip
            content={({ active, payload }) => active && payload?.length
              ? <div style={{ background: '#09090B', color: '#fff', padding: '2px 7px', borderRadius: 4, fontSize: 10.5 }}>
                  {payload[0].value > 0 ? '+' : ''}{payload[0].value}%
                </div>
              : null}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function SellerIntelligence() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('pnl');
  const [filter, setFilter] = useState('all');

  const sellers = useMemo(() => gcv3.map(g => {
    const live   = goLiveTracker.find(l => l.sellerId === g.sellerId);
    const hit    = hitsTracker.find(h => h.sellerId === g.sellerId);
    const meta   = metabase.find(m => m.sellerId === g.sellerId);
    const latest = g.weeks.at(-1);
    const prev   = g.weeks.at(-2);
    const last2  = g.weeks.slice(-2);
    const isPotential = last2.every(w => w.pnl > 5) && latest.spend > 3500 && g.pq > 2.8 && !hit?.isHit;
    return {
      sellerId: g.sellerId, sellerName: g.sellerName,
      gc: live?.gc ?? '—', isLive: live?.isLive ?? false,
      latestPnl: latest.pnl, prevPnl: prev?.pnl ?? null, latestSpend: latest.spend,
      pq: g.pq, weeks: g.weeks, isHit: hit?.isHit ?? false, isPotential,
      orders: meta?.orders ?? 0, gmv: meta?.gmv ?? 0, rto: meta?.rto ?? 0,
      isPaused: live?.isLive && latest.spend === 0,
    };
  }), []);

  const filtered = useMemo(() => {
    let list = sellers;
    if (search)            list = list.filter(s => s.sellerName.toLowerCase().includes(search.toLowerCase()) || s.gc.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'live')      list = list.filter(s => s.isLive);
    if (filter === 'hit')       list = list.filter(s => s.isHit);
    if (filter === 'potential') list = list.filter(s => s.isPotential);
    if (filter === 'paused')    list = list.filter(s => s.isPaused);
    if (filter === 'rto')       list = list.filter(s => s.rto > 30);

    if (sortBy === 'pnl')   return [...list].sort((a, b) => b.latestPnl - a.latestPnl);
    if (sortBy === 'spend') return [...list].sort((a, b) => b.latestSpend - a.latestSpend);
    if (sortBy === 'rto')   return [...list].sort((a, b) => b.rto - a.rto);
    if (sortBy === 'gmv')   return [...list].sort((a, b) => b.gmv - a.gmv);
    return list;
  }, [sellers, search, filter, sortBy]);

  return (
    <div style={{ width: '100%' }}>
      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div className="search-wrap">
          <Search size={13} />
          <input className="search-input" placeholder="Search sellers, GC..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'live', label: '✓ Live' },
            { id: 'hit', label: '⭐ Hits' },
            { id: 'potential', label: '🎯 Potentials' },
            { id: 'paused', label: '⛔ Paused' },
            { id: 'rto', label: '📦 High RTO' },
          ].map(f => (
            <button key={f.id} className={`fchip ${filter === f.id ? 'on' : ''}`} onClick={() => setFilter(f.id)}>{f.label}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArrowUpDown size={13} style={{ color: 'var(--tx-muted)' }} />
          <select
            style={{
              padding: '5px 10px', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', fontSize: '0.76rem',
              background: 'var(--bg-surface)', color: 'var(--tx-primary)',
              fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
            }}
            value={sortBy} onChange={e => setSortBy(e.target.value)}
          >
            <option value="pnl">PnL</option>
            <option value="spend">Spend</option>
            <option value="gmv">GMV</option>
            <option value="rto">RTO ↑</option>
          </select>
          <span style={{ fontSize: '0.7rem', color: 'var(--tx-muted)', fontFamily: "'JetBrains Mono', monospace" }}>{filtered.length} sellers</span>
        </div>
      </div>

      {/* Full-width table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 1000 }}>
            <thead>
              <tr>
                <th>Seller</th>
                <th>GC</th>
                <th>Status</th>
                <th>4W PnL Trend</th>
                <th style={{ textAlign: 'right' }}>PnL</th>
                <th style={{ textAlign: 'right' }}>Spend</th>
                <th style={{ textAlign: 'right' }}>GMV</th>
                <th style={{ textAlign: 'right' }}>Orders</th>
                <th style={{ textAlign: 'right' }}>RTO</th>
                <th style={{ textAlign: 'right' }}>PQ</th>
                <th>Hit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const chartColor = s.latestPnl > 5 ? '#059669' : s.latestPnl > 0 ? '#D97706' : '#E11D48';
                return (
                  <tr key={s.sellerId}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--tx-primary)' }}>{s.sellerName}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--tx-muted)', fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>{s.sellerId}</div>
                    </td>
                    <td style={{ color: 'var(--tx-secondary)', fontSize: '0.8rem' }}>{s.gc}</td>
                    <td>
                      {s.isLive
                        ? <span className="pill pill-live"><span className="dot dot-green dot-pulse" />Live</span>
                        : <span className="pill pill-offline"><span className="dot dot-gray" />Offline</span>
                      }
                      {s.isPaused && <span className="pill pill-paused" style={{ marginLeft: 4 }}>Paused</span>}
                    </td>
                    <td><MiniChart weeks={s.weeks} color={chartColor} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="num" style={{ color: pnlColor(s.latestPnl), fontWeight: 700 }}>
                        {s.latestPnl > 0 ? '+' : ''}{s.latestPnl}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="num">{s.latestSpend === 0 ? <span style={{ color: 'var(--danger)', fontWeight: 600 }}>—</span> : formatINR(s.latestSpend)}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}><span className="num">{formatINR(s.gmv)}</span></td>
                    <td style={{ textAlign: 'right' }}><span className="num">{s.orders.toLocaleString()}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="num" style={{ color: s.rto > 30 ? 'var(--danger)' : s.rto > 20 ? 'var(--warning)' : 'var(--tx-secondary)', fontWeight: s.rto > 30 ? 700 : 500 }}>
                        {s.rto}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="num" style={{ color: s.pq >= 2.8 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>{s.pq}</span>
                    </td>
                    <td>
                      {s.isHit ? <span className="chip-hit">⭐ Hit</span>
                        : s.isPotential ? <span className="chip-potential">🎯 Soon</span>
                        : <span style={{ color: 'var(--tx-muted)', fontSize: '0.72rem' }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
