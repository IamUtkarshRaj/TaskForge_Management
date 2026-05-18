import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.updateMe({ name });
      toast.success('Profile updated successfully (Please refresh to see changes globally)');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Account Settings</h1>
      </div>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        {/* Left Nav */}
        <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button 
            onClick={() => setActiveTab('profile')}
            style={{ textAlign: 'left', padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: 'none', background: activeTab === 'profile' ? 'var(--primary-dim)' : 'transparent', color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-2)', cursor: 'pointer', fontWeight: '500', fontSize: '13.5px' }}
          >
            Profile
          </button>
          <button 
            onClick={() => setActiveTab('account')}
            style={{ textAlign: 'left', padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: 'none', background: activeTab === 'account' ? 'var(--primary-dim)' : 'transparent', color: activeTab === 'account' ? 'var(--primary)' : 'var(--text-2)', cursor: 'pointer', fontWeight: '500', fontSize: '13.5px' }}
          >
            Account Preferences
          </button>
        </div>

        {/* Right Content */}
        <div style={{ flex: 1, maxWidth: '600px' }}>
          {activeTab === 'profile' && (
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: '24px' }}>Public Profile</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '28px', fontWeight: '700' }}>
                  {user?.name?.charAt(0)}
                </div>
                <button className="btn btn-secondary btn-sm">Change Photo</button>
              </div>

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={user?.email} disabled style={{ opacity: 0.6 }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>Email cannot be changed</span>
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <div><span className={`role-badge ${user?.role.toLowerCase()}`}>{user?.role}</span></div>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                  <button type="submit" className="btn btn-primary" disabled={isLoading || name === user?.name}>
                    {isLoading ? <div className="btn-spinner" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: '24px' }}>Account Preferences</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '13.5px' }}>More settings coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
