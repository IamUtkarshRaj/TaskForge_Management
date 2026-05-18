import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api';
import toast from 'react-hot-toast';
import { Shield, Mail, Clock, Search } from 'lucide-react';
import { format } from 'date-fns';

const AdminPanel = () => {
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', debouncedSearch, page],
    queryFn: async () => {
      const res = await adminApi.getUsers({ search: debouncedSearch, page, limit: 10 });
      return res.data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await adminApi.getStats();
      return res.data;
    }
  });

  const updateRole = useMutation({
    mutationFn: ({ userId, role }) => adminApi.updateUserRole(userId, role),
    onMutate: (vars) => setUpdatingId(vars.userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User role updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to update role');
    },
    onSettled: () => setUpdatingId(null)
  });

  if (isLoading) return <div className="page-loading"><div className="spinner"></div></div>;

  const users = data?.users || [];
  const pagination = data?.pagination || { total: 0, page: 1, pages: 1 };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage users and monitor system statistics.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{stats?.totalUsers || 0}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{stats?.totalProjects || 0}</span>
            <span className="stat-label">Total Projects</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{stats?.totalTasks || 0}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title">User Management</h2>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: 'var(--surface-high)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px 8px 36px', color: 'var(--text)', fontSize: '13px', width: '220px' }}
            />
          </div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Joined</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)' }}>
                    No users found matching "{searchQuery}"
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="member-avatar">{user.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: '500', color: 'var(--text)' }}>{user.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={12} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-2)', fontFamily: 'JetBrains Mono' }}>
                      <Clock size={12} /> {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                  </td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => updateRole.mutate({ userId: user.id, role: e.target.value })}
                      disabled={updatingId === user.id}
                      style={{ width: '120px', padding: '6px 10px', fontSize: '12px' }}
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>
              Showing page {pagination.page} of {pagination.pages}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
