import { useState } from 'react';
import { X } from 'lucide-react';
import { goLiveTracker } from '../data/mockData';
import { enrichSellerContext } from '../engines/contextEnricher';

const SELLERS = goLiveTracker.map(s => s.sellerName);

export default function AddTaskModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    title: '', description: '', source: 'self',
    impact: 'medium', urgency: 'today', sellerName: '', tags: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const ctx = form.sellerName ? enrichSellerContext(null, form.sellerName) : null;
    onAdd({
      id: `u-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      source: form.source,
      impact: form.impact,
      urgency: form.urgency,
      sellerName: form.sellerName || null,
      sellerId: ctx?.sellerId || null,
      sellerContext: ctx,
      createdAt: new Date().toISOString(),
      status: 'open',
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <div>
            <div className="modal-title">Capture Task</div>
            <div className="modal-sub">Seller context auto-enriches if seller is attached</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ color: 'var(--tx-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-grp">
              <label className="form-lbl">Task <span>*</span></label>
              <input className="form-ctrl" placeholder="What needs to be done?" value={form.title} onChange={e => set('title', e.target.value)} autoFocus />
            </div>

            <div className="form-grp">
              <label className="form-lbl">Context <span>(optional)</span></label>
              <textarea className="form-ctrl form-textarea" placeholder="Notes, instructions, or context..." value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            <div className="form-grp">
              <label className="form-lbl">Seller <span>(auto-enriches data context)</span></label>
              <select className="form-ctrl" value={form.sellerName} onChange={e => set('sellerName', e.target.value)}>
                <option value="">No seller attached</option>
                {SELLERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-row">
              <div className="form-grp">
                <label className="form-lbl">Source</label>
                <select className="form-ctrl" value={form.source} onChange={e => set('source', e.target.value)}>
                  <option value="manager">Manager</option>
                  <option value="gc">GC</option>
                  <option value="self">Self</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>
              <div className="form-grp">
                <label className="form-lbl">Urgency</label>
                <select className="form-ctrl" value={form.urgency} onChange={e => set('urgency', e.target.value)}>
                  <option value="urgent">Urgent</option>
                  <option value="today">Today</option>
                  <option value="later">Later</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-grp">
                <label className="form-lbl">Impact</label>
                <select className="form-ctrl" value={form.impact} onChange={e => set('impact', e.target.value)}>
                  <option value="potential_hit">Potential Hit</option>
                  <option value="paused">Paused Account</option>
                  <option value="high">High Impact</option>
                  <option value="medium">Medium</option>
                  <option value="admin">Admin / Low</option>
                </select>
              </div>
              <div className="form-grp">
                <label className="form-lbl">Tags <span>(comma separated)</span></label>
                <input className="form-ctrl" placeholder="rto, meta, golive..." value={form.tags} onChange={e => set('tags', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="modal-ft">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Add Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}
