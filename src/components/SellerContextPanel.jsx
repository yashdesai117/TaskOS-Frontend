import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function SellerContextPanel({ ctx }) {
  if (!ctx) return null;

  const pnl    = ctx.latestPnl;
  const pnlStr = pnl != null ? `${pnl > 0 ? '+' : ''}${pnl}%` : '—';
  const pnlCls = pnl > 5 ? 'pos' : pnl > 0 ? 'warn' : 'neg';
  const TrendIcon = ctx.pnlTrend > 0 ? TrendingUp : ctx.pnlTrend < 0 ? TrendingDown : Minus;

  return (
    <div className="ctx-panel">
      <div className="ctx-item">
        <span className="ctx-lbl">GC</span>
        <span className="ctx-val">{ctx.gc}</span>
      </div>
      <div className="ctx-item">
        <span className="ctx-lbl">Live</span>
        <span className={`ctx-val ${ctx.isLive ? 'pos' : 'neg'}`}>{ctx.isLive ? '✓ Yes' : '✗ No'}</span>
      </div>
      <div className="ctx-item">
        <span className="ctx-lbl">PnL (Latest)</span>
        <span className={`ctx-val ${pnlCls}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {pnlStr}
          <TrendIcon size={11} />
        </span>
      </div>
      <div className="ctx-item">
        <span className="ctx-lbl">Spend</span>
        <span className="ctx-val">
          {ctx.latestSpend != null ? `₹${ctx.latestSpend.toLocaleString('en-IN')}` : '—'}
        </span>
      </div>
      {ctx.pq != null && (
        <div className="ctx-item">
          <span className="ctx-lbl">PQ</span>
          <span className={`ctx-val ${ctx.pq >= 2.8 ? 'pos' : 'neg'}`}>{ctx.pq}</span>
        </div>
      )}
      {ctx.rto != null && (
        <div className="ctx-item">
          <span className="ctx-lbl">RTO</span>
          <span className={`ctx-val ${ctx.rto > 30 ? 'neg' : ''}`}>{ctx.rto}%</span>
        </div>
      )}
      <div className="ctx-item">
        <span className="ctx-lbl">Status</span>
        <span>
          {ctx.isHit
            ? <span className="chip-hit">⭐ Hit</span>
            : ctx.isPotentialHit
              ? <span className="chip-potential">🎯 Potential</span>
              : <span style={{ fontSize: '0.72rem', color: 'var(--tx-muted)' }}>Tracking</span>
          }
        </span>
      </div>
    </div>
  );
}
