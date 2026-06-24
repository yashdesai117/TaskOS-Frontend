// ============================================================
// DATA LAYER — Syncs with Google Sheets via Backend
// ============================================================

export let GCS = [
  { id: 'gc1', name: 'Divyanshi', assignedCount: 42 },
  { id: 'gc2', name: 'Vikas', assignedCount: 41 },
];

export let goLiveTracker = [];
export let gcv3 = [];
export let hitsTracker = [];
export let dailyMetrics = {};
export let metabase = [];

export function updateSheetData(data) {
  if (data.goLiveTracker) goLiveTracker = data.goLiveTracker;
  if (data.gcv3) gcv3 = data.gcv3;
  if (data.hitsTracker) hitsTracker = data.hitsTracker;
  if (data.dailyMetrics) dailyMetrics = data.dailyMetrics;
}
// Old mock data deleted.

// ── Initial Seed Tasks (human-created) ────────────────────
export const seedTasks = [
  {
    id: 't001',
    title: 'Give Vikas ad account access',
    description: 'Shared in WhatsApp by manager',
    source: 'manager',
    impact: 'admin',
    urgency: 'urgent',
    sellerId: null,
    sellerName: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    tags: ['access', 'meta'],
  },
  {
    id: 't002',
    title: 'Check Young Veda RTO issue',
    description: 'Divyanshi flagged high return rate in weekly review',
    source: 'gc',
    impact: 'high',
    urgency: 'today',
    sellerId: 'SD001',
    sellerName: 'Young Veda',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    tags: ['rto', 'review'],
  },
  {
    id: 't003',
    title: 'Review Bloom Naturals for Hit readiness',
    description: 'Looking strong — 2 consecutive positive weeks',
    source: 'self',
    impact: 'potential_hit',
    urgency: 'today',
    sellerId: 'SD002',
    sellerName: 'Bloom Naturals',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    tags: ['hit', 'review'],
  },
  {
    id: 't004',
    title: 'Follow up on Kiran Crafts GoLive',
    description: '14 days and still not live — needs escalation',
    source: 'gc',
    impact: 'high',
    urgency: 'today',
    sellerId: 'SD003',
    sellerName: 'Kiran Crafts',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    tags: ['golive', 'escalation'],
  },
  {
    id: 't005',
    title: 'Weekly team sync — prepare agenda',
    description: 'Monday GC review meeting',
    source: 'self',
    impact: 'admin',
    urgency: 'later',
    sellerId: null,
    sellerName: null,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    tags: ['meeting', 'team'],
  },
];
