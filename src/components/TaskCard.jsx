import { formatDistanceToNow } from '../utils/formatters';
import PriorityBadge from './PriorityBadge';
import SellerContextPanel from './SellerContextPanel';

const SRC_LABELS = { manager: 'Manager', gc: 'GC', system: 'Data Alert', self: 'Self', meeting: 'Meeting', whatsapp: '💬 WhatsApp' };
const SRC_CLS    = { manager: 'sbadge-manager', gc: 'sbadge-gc', system: 'sbadge-system', self: 'sbadge-self', meeting: 'sbadge-self', whatsapp: 'sbadge-manager' };

export default function TaskCard({ task, rank, onComplete }) {
  const score  = task.score?.total ?? 0;
  const pLevel = score >= 30 ? 'critical' : score >= 22 ? 'high' : score >= 15 ? 'medium' : 'low';
  const rCls   = rank === 0 ? 'r1' : rank === 1 ? 'r2' : rank === 2 ? 'r3' : '';

  return (
    <div className="task-card enter" style={{ animationDelay: `${(rank ?? 0) * 40}ms` }}>
      <div className={`task-card-accent accent-${pLevel}`} />
      <div className="task-card-inner">
        <div className="task-card-top">
          {rank != null && (
            <div className={`task-rank ${rCls}`}>{rank + 1}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="task-badges">
              <PriorityBadge score={score} />
              <span className={`sbadge ${SRC_CLS[task.source] || 'sbadge-self'}`}>
                {SRC_LABELS[task.source] || task.source}
              </span>
              {task.score && (
                <span className="score-chip">#{score}</span>
              )}
            </div>
            <div className="task-title">{task.title}</div>
          </div>
          {onComplete && (
            <button className="done-btn" onClick={e => { e.stopPropagation(); onComplete(task.id); }}>
              ✓ Done
            </button>
          )}
        </div>

        {task.description && (
          <p className="task-desc">{task.description}</p>
        )}

        {task.sellerContext && <SellerContextPanel ctx={task.sellerContext} />}

        <div className="task-footer">
          <div className="task-meta">
            <span className="task-time">{formatDistanceToNow(task.createdAt)}</span>
            {task.sellerName && (
              <span className="task-seller-name">📍 {task.sellerName}</span>
            )}
          </div>
          {task.tags?.length > 0 && (
            <div className="task-tags">
              {task.tags.slice(0, 3).map(t => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
