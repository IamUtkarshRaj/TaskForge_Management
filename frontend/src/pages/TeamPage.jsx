import { useQuery } from '@tanstack/react-query';
import { adminApi, projectsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { Mail, Clock, MoreVertical, Circle } from 'lucide-react';

const TeamPage = () => {
  const { user } = useAuth();
  
  // If admin, fetch all users. If member, just fetch projects and extract members (simplified for UI)
  const { data: users, isLoading } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      if (user.role === 'ADMIN') {Generating
        const res = await adminApi.getUsers();
        return res.data;
      }
      // For non-admins, returning a subset or empty (in a real app, backend would provide a /team endpoint)
      return [];
    }
  });

  if (isLoading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Directory</h1>
          <p className="page-subtitle">Manage and view people in your workspace.</p>
        </div>
        {user.role === 'ADMIN' && (
          <div className="page-actions">
            <button className="btn btn-primary">Invite Member</button>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{users?.length || 1}</span>
            <span className="stat-label">Total Members</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{users?.filter(u => u.role === 'ADMIN').length || 1}</span>
            <span className="stat-label">Admins</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {users?.length > 0 ? users.map((member) => (
              <tr key={member.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', color: 'var(--text)' }}>{member.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={12} /> {member.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${member.role.toLowerCase()}`}>{member.role}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-2)' }}>
                    <Circle size={10} color="var(--success)" fill="var(--success)" /> Active
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-2)', fontFamily: 'JetBrains Mono' }}>
                    <Clock size={12} /> {new Date(member.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="empty-row">
                  {user.role === 'ADMIN' ? 'No team members found.' : 'You must be an admin to view the full directory.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamPage;
