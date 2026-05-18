import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Shield, Zap, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const LandingPage = () => {
  const { user } = useAuth();

  // If already logged in, go straight to app
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Zap size={20} />
          </div>
          <span style={{ fontFamily: 'Sora', fontSize: '20px', fontWeight: '700' }}>TaskForge</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/login" style={{ color: 'var(--text-2)', textDecoration: 'none', fontWeight: '500' }}>Log in</Link>
          <Link to="/signup" className="btn btn-primary">Get Started</Link>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section style={{ padding: '100px 20px', textAlign: 'center', background: 'radial-gradient(ellipse at top, var(--primary-dim) 0%, transparent 50%)' }}>
          <h1 style={{ fontFamily: 'Sora', fontSize: '64px', fontWeight: '700', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.03em' }}>
            Ship faster.<br />Together.
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--text-2)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.5 }}>
            The professional command center for technical teams to plan, track, and execute high-impact work.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '16px', borderRadius: 'var(--radius-md)' }}>
              Start for free <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '80px 40px', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Sora', fontSize: '32px', textAlign: 'center', marginBottom: '60px' }}>Engineered for Performance</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              <div style={{ padding: '32px', background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <CheckCircle2 size={32} color="var(--primary)" style={{ marginBottom: '20px' }} />
                <h3 style={{ fontFamily: 'Sora', fontSize: '20px', marginBottom: '12px' }}>Intelligent Workflows</h3>
                <p style={{ color: 'var(--text-2)' }}>Automated status tracking, smart prioritization, and real-time updates keep your team in sync without the noise.</p>
              </div>
              <div style={{ padding: '32px', background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <BarChart2 size={32} color="var(--warning)" style={{ marginBottom: '20px' }} />
                <h3 style={{ fontFamily: 'Sora', fontSize: '20px', marginBottom: '12px' }}>Deep Analytics</h3>
                <p style={{ color: 'var(--text-2)' }}>Understand your team's velocity, identify bottlenecks, and make data-driven decisions with built-in reporting.</p>
              </div>
              <div style={{ padding: '32px', background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <Zap size={32} color="var(--success)" style={{ marginBottom: '20px' }} />
                <h3 style={{ fontFamily: 'Sora', fontSize: '20px', marginBottom: '12px' }}>Instant Responsiveness</h3>
                <p style={{ color: 'var(--text-2)' }}>Built on modern infrastructure, TaskForge reacts instantly. No loading spinners, no waiting. Just pure speed.</p>
              </div>
              <div style={{ padding: '32px', background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <Shield size={32} color="var(--info)" style={{ marginBottom: '20px' }} />
                <h3 style={{ fontFamily: 'Sora', fontSize: '20px', marginBottom: '12px' }}>Enterprise Security</h3>
                <p style={{ color: 'var(--text-2)' }}>Role-based access control, secure data encryption, and comprehensive audit logs keep your work safe.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)', fontSize: '12px', fontFamily: 'JetBrains Mono' }}>
        <p>© 2026 TaskForge Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
