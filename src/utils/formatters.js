export function formatDistanceToNow(isoString) {
  const now   = Date.now();
  const then  = new Date(isoString).getTime();
  const diff  = Math.floor((now - then) / 1000);

  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatINR(amount) {
  if (amount == null) return '—';
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000)   return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

export function pnlColor(pnl) {
  if (pnl == null) return 'var(--text-tertiary)';
  if (pnl > 5)  return 'var(--success)';
  if (pnl > 0)  return 'var(--warning)';
  return 'var(--danger)';
}
