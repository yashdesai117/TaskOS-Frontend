// ============================================================
// PRIORITIZATION ENGINE
// Scores tasks based on source, impact, urgency, revenue potential
// ============================================================

const SOURCE_SCORES   = { manager: 10, gc: 7, system: 5, self: 4 };
const IMPACT_SCORES   = { potential_hit: 15, paused: 12, high: 9, medium: 6, admin: 3, low: 2 };
const URGENCY_SCORES  = { urgent: 10, today: 7, later: 3 };

export function scoreTask(task) {
  const sourceScore   = SOURCE_SCORES[task.source]   ?? 3;
  const impactScore   = IMPACT_SCORES[task.impact]   ?? 5;
  const urgencyScore  = URGENCY_SCORES[task.urgency] ?? 3;

  // Revenue impact bonus — based on seller spend or GMV
  let revenueBonus = 0;
  if (task.sellerContext) {
    const spend = task.sellerContext.latestSpend ?? 0;
    const gmv   = task.sellerContext.gmv ?? 0;
    revenueBonus = Math.min(15, Math.floor((spend + gmv * 0.05) / 2000));
  }

  const total = sourceScore + impactScore + urgencyScore + revenueBonus;
  return { sourceScore, impactScore, urgencyScore, revenueBonus, total };
}

export function prioritizeTasks(tasks) {
  return tasks
    .map(t => ({ ...t, score: scoreTask(t) }))
    .sort((a, b) => b.score.total - a.score.total);
}

export function getPriorityLabel(score) {
  if (score >= 30) return { label: 'Critical', color: '#ff4757' };
  if (score >= 22) return { label: 'High',     color: '#ff6b35' };
  if (score >= 15) return { label: 'Medium',   color: '#ffa502' };
  return               { label: 'Low',      color: '#2ed573' };
}
