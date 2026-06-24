// ============================================================
// DATA TASK GENERATOR ENGINE
// Scans mock data and auto-generates tasks based on business rules
// ============================================================
import { gcv3, goLiveTracker, metabase } from '../data/mockData';
import { enrichSellerContext } from './contextEnricher';

let _taskIdCounter = 1000;
const nextId = () => `sys-${++_taskIdCounter}`;

export function generateDataTasks() {
  const tasks = [];
  const now   = new Date().toISOString();

  // ── Rule 1: Potential Hit Detection ───────────────────────
  // PnL > 5% for 2 consecutive weeks AND Spend > ₹3,500 AND PQ > 2.8
  gcv3.forEach(seller => {
    const last2   = seller.weeks.slice(-2);
    const liveRec = goLiveTracker.find(g => g.sellerId === seller.sellerId);
    if (
      last2.length === 2 &&
      last2.every(w => w.pnl > 5) &&
      last2.at(-1).spend > 3500 &&
      seller.pq > 2.8 &&
      liveRec?.isLive
    ) {
      tasks.push({
        id:           nextId(),
        title:        `🎯 Review ${seller.sellerName} for Hit readiness`,
        description:  `PnL: +${last2.at(-1).pnl}% (2 consecutive weeks) | Spend: ₹${last2.at(-1).spend.toLocaleString()} | PQ: ${seller.pq}`,
        source:       'system',
        impact:       'potential_hit',
        urgency:      'today',
        sellerId:     seller.sellerId,
        sellerName:   seller.sellerName,
        alertType:    'potential_hit',
        createdAt:    now,
        status:       'open',
        tags:         ['hit', 'system', 'auto'],
        sellerContext: enrichSellerContext(seller.sellerId, seller.sellerName),
      });
    }
  });

  // ── Rule 2: Paused Account Detection ──────────────────────
  // Prev week spend > 0 AND current week spend = 0
  gcv3.forEach(seller => {
    const weeks = seller.weeks;
    const prev  = weeks.at(-2);
    const curr  = weeks.at(-1);
    if (prev && curr && prev.spend > 0 && curr.spend === 0) {
      tasks.push({
        id:           nextId(),
        title:        `⛔ Investigate paused account — ${seller.sellerName}`,
        description:  `Was spending ₹${prev.spend.toLocaleString()} last week. Now ₹0. Needs immediate attention.`,
        source:       'system',
        impact:       'paused',
        urgency:      'urgent',
        sellerId:     seller.sellerId,
        sellerName:   seller.sellerName,
        alertType:    'paused_account',
        createdAt:    now,
        status:       'open',
        tags:         ['paused', 'system', 'urgent'],
        sellerContext: enrichSellerContext(seller.sellerId, seller.sellerName),
      });
    }
  });

  // ── Rule 3: High RTO Detection ────────────────────────────
  // RTO > 30%
  metabase.forEach(seller => {
    if (seller.rto > 30 && seller.orders > 10) {
      tasks.push({
        id:           nextId(),
        title:        `📦 High RTO alert — ${seller.sellerName}`,
        description:  `RTO at ${seller.rto}% (threshold: 30%). ${seller.orders} orders with high return rate.`,
        source:       'system',
        impact:       'high',
        urgency:      'today',
        sellerId:     seller.sellerId,
        sellerName:   seller.sellerName,
        alertType:    'high_rto',
        createdAt:    now,
        status:       'open',
        tags:         ['rto', 'system', 'auto'],
        sellerContext: enrichSellerContext(seller.sellerId, seller.sellerName),
      });
    }
  });

  // ── Rule 4: PnL Deterioration ─────────────────────────────
  // Week N PnL < Week N-1 PnL by more than 20%
  gcv3.forEach(seller => {
    const prev = seller.weeks.at(-2);
    const curr = seller.weeks.at(-1);
    if (prev && curr && prev.pnl > 0) {
      const drop = prev.pnl - curr.pnl;
      if (drop > 5 && curr.spend > 2000) {
        tasks.push({
          id:           nextId(),
          title:        `📉 PnL deterioration — ${seller.sellerName}`,
          description:  `Dropped from ${prev.pnl > 0 ? '+' : ''}${prev.pnl}% to ${curr.pnl > 0 ? '+' : ''}${curr.pnl}% this week. Spend: ₹${curr.spend.toLocaleString()}`,
          source:       'system',
          impact:       'high',
          urgency:      'today',
          sellerId:     seller.sellerId,
          sellerName:   seller.sellerName,
          alertType:    'pnl_deterioration',
          createdAt:    now,
          status:       'open',
          tags:         ['pnl', 'system', 'auto'],
          sellerContext: enrichSellerContext(seller.sellerId, seller.sellerName),
        });
      }
    }
  });

  // ── Rule 5: GoLive Delay ──────────────────────────────────
  // A2H > 7 days AND not live
  goLiveTracker.forEach(seller => {
    if (!seller.isLive && seller.a2hDays > 7) {
      tasks.push({
        id:           nextId(),
        title:        `🚨 GoLive delay — ${seller.sellerName}`,
        description:  `${seller.a2hDays} days since A2H and still not live. GC: ${seller.gc}. Escalation needed.`,
        source:       'system',
        impact:       'high',
        urgency:      seller.a2hDays > 14 ? 'urgent' : 'today',
        sellerId:     seller.sellerId,
        sellerName:   seller.sellerName,
        alertType:    'golive_delay',
        createdAt:    now,
        status:       'open',
        tags:         ['golive', 'system', 'delay'],
        sellerContext: enrichSellerContext(seller.sellerId, seller.sellerName),
      });
    }
  });

  return tasks;
}

export const ALERT_TYPE_META = {
  potential_hit:    { label: 'Potential Hit',      icon: '🎯', color: 'var(--success-mid)', bg: 'var(--success-bg)' },
  paused_account:   { label: 'Paused Account',     icon: '⛔', color: 'var(--danger-mid)',  bg: 'var(--danger-bg)'  },
  high_rto:         { label: 'High RTO',           icon: '📦', color: 'var(--warning-mid)', bg: 'var(--warning-bg)'  },
  pnl_deterioration:{ label: 'PnL Deterioration',  icon: '📉', color: 'var(--warning-mid)', bg: 'var(--warning-bg)' },
  golive_delay:     { label: 'GoLive Delay',       icon: '🚨', color: 'var(--danger-mid)',  bg: 'var(--danger-bg)'  },
};
