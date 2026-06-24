import { getPriorityLabel } from '../engines/prioritization';

export default function PriorityBadge({ score }) {
  const { label } = getPriorityLabel(score);
  const cls = label.toLowerCase();
  // 4-color palette: rose / amber-dark / amber-mid / emerald
  const dots = {
    critical: '#E11D48',
    high:     '#B45309',
    medium:   '#D97706',
    low:      '#059669',
  };
  return (
    <span className={`pbadge pbadge-${cls}`}>
      <span className="pbadge-dot" style={{ background: dots[cls] }} />
      {label}
    </span>
  );
}
