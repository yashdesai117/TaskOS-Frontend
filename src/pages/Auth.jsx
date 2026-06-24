import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Target } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        // Validate domain
        if (!email.endsWith('@blitzscale.co') && !email.endsWith('@shopdeck.com')) {
          throw new Error("Unauthorized domain. Only @blitzscale.co or @shopdeck.com emails are allowed.");
        }
        
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Account created successfully! You can now log in.");
        setIsSignUp(false); // Switch to sign in after sign up
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', width: '100vw', background: 'var(--bg-root)', padding: 20
    }}>
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: 'var(--bg-surface)',
          border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Target size={22} style={{ color: 'var(--tx-primary)' }} />
        </div>
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--tx-primary)', letterSpacing: '-0.02em' }}>Task OS</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--tx-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Workspace</div>
        </div>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: 360, padding: 32 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--tx-primary)', marginBottom: 8 }}>
          {isSignUp ? 'Create your account' : 'Sign in to Task OS'}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--tx-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
          {isSignUp 
            ? 'Enter your official @blitzscale.co or @shopdeck.com email to get started.' 
            : 'Welcome back! Please enter your details.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--tx-secondary)', marginBottom: 6, fontWeight: 500 }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@blitzscale.co"
              style={{
                width: '100%', padding: '10px 12px', background: 'var(--bg-app)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                color: 'var(--tx-primary)', fontSize: '0.9rem', outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--tx-muted)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--tx-secondary)', marginBottom: 6, fontWeight: 500 }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 12px', background: 'var(--bg-app)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                color: 'var(--tx-primary)', fontSize: '0.9rem', outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--tx-muted)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(225, 29, 72, 0.1)', color: 'var(--danger)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', border: '1px solid rgba(225, 29, 72, 0.2)' }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%', padding: '10px', background: 'var(--tx-primary)', color: '#FFFFFF',
              border: 'none', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 8,
              transition: 'transform 0.1s, opacity 0.2s'
            }}
            onMouseDown={e => !loading && (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.85rem', color: 'var(--tx-secondary)' }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ 
              background: 'none', border: 'none', color: 'var(--tx-primary)', 
              fontWeight: 600, cursor: 'pointer', padding: 0 
            }}
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
}
