export default function MetricTile({ label, value, sub, icon: Icon, iconBg, change, changeDir }) {
  return (
    <div className="metric-tile">
      <div className="metric-tile-header">
        <span className="metric-tile-label">{label}</span>
        {Icon && (
          <div className="metric-tile-icon" style={{ background: iconBg || 'var(--bg-subtle)' }}>
            <Icon size={14} style={{ color: 'white' }} />
          </div>
        )}
      </div>
      <div className="metric-tile-value">{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        {sub && <span className="metric-tile-sub">{sub}</span>}
        {change != null && (
          <span className={`metric-tile-change ${changeDir}`}>
            {changeDir === 'up' ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
    </div>
  );
}
