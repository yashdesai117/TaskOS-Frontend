import { useState, useMemo, useEffect, useRef } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import CommandCenter from './pages/CommandCenter';
import TaskBoard from './pages/TaskBoard';
import SellerIntelligence from './pages/SellerIntelligence';
import DataAlerts from './pages/DataAlerts';
import TeamPerformance from './pages/TeamPerformance';
import { seedTasks, updateSheetData } from './data/mockData';
import { enrichTask } from './engines/contextEnricher';
import { supabase } from './lib/supabase';
import Auth from './pages/Auth';

const PAGE_META = {
  command: { title: 'Command Center',     subtitle: 'Your highest-priority actions, right now' },
  tasks:   { title: 'Task Board',          subtitle: 'Prioritized by source · impact · urgency · revenue' },
  sellers: { title: 'Seller Intelligence', subtitle: 'GCV3 · GoLive Tracker · Hits Tracker · Metabase — unified' },
  alerts:  { title: 'Data Alerts',         subtitle: 'Auto-generated tasks from your data ecosystem' },
  team:    { title: 'Team Performance',    subtitle: 'GC KPIs · Live by Assigned · Spend by Live · Hits' },
};

export default function App() {
  const [activePage, setActivePage] = useState('command');
  const [tick, setTick] = useState(0); // Forces re-render when mutable mockData updates
  const [tasks, setTasks] = useState(() =>
    seedTasks.map(t => ({ ...t, sellerContext: enrichTask(t).sellerContext }))
  );
  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const completedIdsRef = useRef(new Set());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const pollWhatsApp = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const res = await fetch(`${API_BASE}/api/tasks`);
        const data = await res.json();
        if (data.tasks && data.tasks.length > 0) {
          setTasks(prev => {
            const newTasks = data.tasks
              .filter(t => !prev.some(p => p.id === t.id))
              .filter(t => !completedIdsRef.current.has(t.id))
              .map(t => enrichTask({ ...t, source: 'whatsapp' }));
            if (newTasks.length === 0) return prev;
            return [...newTasks, ...prev];
          });
        }
      } catch (e) {
        // Silently ignore if backend is down
      }
    };
    
    pollWhatsApp();
    const interval = setInterval(pollWhatsApp, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pollSheets = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const res = await fetch(`${API_BASE}/api/sheets/data`);
        const data = await res.json();
        if (Object.keys(data).length > 0) {
          updateSheetData(data);
          setTick(t => t + 1);
        }
      } catch (e) {}
    };
    pollSheets();
    const interval = setInterval(pollSheets, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAdd      = (task) => setTasks(prev => [task, ...prev]);
  const handleComplete = (id)   => {
    completedIdsRef.current.add(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const { title, subtitle } = PAGE_META[activePage] || {};

  if (isAuthLoading) {
    return <div style={{ height: '100vh', width: '100vw', background: 'var(--bg-root)' }} />;
  }

  if (!session) {
    return <Auth />;
  }

  const userEmail = session.user.email;
  const isAuthorizedAdmin = userEmail === 'desai.yash@blitzscale.co';

  if (!isAuthorizedAdmin) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-root)' }}>
        <div className="main-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 400 }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--tx-primary)', marginBottom: 12 }}>Welcome to Task OS</h2>
            <p style={{ color: 'var(--tx-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 24 }}>
              Your workspace data is currently being provisioned. You will be notified when your dashboard is ready.
            </p>
            <button 
              onClick={() => supabase.auth.signOut()}
              style={{
                padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--tx-primary)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="main-wrapper">
        {/* Top Bar */}
        <div className="page-topbar">
          <div className="topbar-left">
            <div className="page-title">{title}</div>
            <div className="page-subtitle">{subtitle}</div>
          </div>
          <div className="topbar-right">
            <div className="live-indicator">
              <div className="live-dot-pulse" />
              Live · Updated just now
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-scroll">
          {activePage === 'command' && (
            <CommandCenter tasks={tasks} onComplete={handleComplete} onNavigate={setActivePage} />
          )}
          {activePage === 'tasks' && (
            <TaskBoard tasks={tasks} onAdd={handleAdd} onComplete={handleComplete} />
          )}
          {activePage === 'sellers' && <SellerIntelligence />}
          {activePage === 'alerts'  && <DataAlerts onAddToBoard={handleAdd} />}
          {activePage === 'team'    && <TeamPerformance />}
        </div>
      </div>
    </div>
  );
}
