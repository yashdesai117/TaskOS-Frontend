// ============================================================
// CONTEXT ENRICHER ENGINE
// Matches a seller name/ID to data from GCV3, GoLive, Hits Tracker
// ============================================================
import { gcv3, goLiveTracker, hitsTracker, metabase } from '../data/mockData';

export function enrichSellerContext(sellerId, sellerName) {
  if (!sellerId && !sellerName) return null;

  const gcv3Data  = gcv3.find(s => s.sellerId === sellerId || s.sellerName === sellerName);
  const liveData  = goLiveTracker.find(s => s.sellerId === sellerId || s.sellerName === sellerName);
  const hitData   = hitsTracker.find(s => s.sellerId === sellerId || s.sellerName === sellerName);
  const metaData  = metabase.find(s => s.sellerId === sellerId || s.sellerName === sellerName);

  if (!gcv3Data && !liveData) return null;

  const latestWeek  = gcv3Data?.weeks?.at(-1);
  const prevWeek    = gcv3Data?.weeks?.at(-2);
  const pnlTrend    = latestWeek && prevWeek ? latestWeek.pnl - prevWeek.pnl : 0;

  // Hit eligibility: PnL > 5% for 2 consecutive weeks AND spend > 3500 AND PQ > 2.8
  const last2Weeks      = gcv3Data?.weeks?.slice(-2) ?? [];
  const bothProfitable  = last2Weeks.length === 2 && last2Weeks.every(w => w.pnl > 5);
  const spendOk         = latestWeek?.spend > 3500;
  const pqOk            = (gcv3Data?.pq ?? 0) > 2.8;
  const isPotentialHit  = bothProfitable && spendOk && pqOk && !hitData?.isHit;

  return {
    sellerId:       sellerId || gcv3Data?.sellerId || liveData?.sellerId,
    sellerName:     sellerName || gcv3Data?.sellerName || liveData?.sellerName,
    gc:             liveData?.gc ?? '—',
    isLive:         liveData?.isLive ?? false,
    a2hDays:        liveData?.a2hDays ?? null,
    latestPnl:      latestWeek?.pnl ?? null,
    latestSpend:    latestWeek?.spend ?? null,
    pnlTrend,
    pq:             gcv3Data?.pq ?? null,
    isHit:          hitData?.isHit ?? false,
    isPotentialHit,
    spendStatus:    hitData?.spendStatus ?? (latestWeek?.spend > 0 ? 'Active' : 'Paused'),
    orders:         metaData?.orders ?? null,
    gmv:            metaData?.gmv ?? null,
    rto:            metaData?.rto ?? null,
    profitability:  metaData?.profitability ?? null,
  };
}

export function enrichTask(task) {
  if (!task.sellerId && !task.sellerName) return { ...task, sellerContext: null };
  return { ...task, sellerContext: enrichSellerContext(task.sellerId, task.sellerName) };
}
