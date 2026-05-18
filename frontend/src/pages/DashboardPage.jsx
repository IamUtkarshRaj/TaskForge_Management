import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Circle, Clock, Layout, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DashboardPage = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardTasks'],
    queryFn: async () => {
      const res = await tasksApi.getDashboard();
      return res.data;
    }
  });

  if (isLoading) return <div className="page-loading"><div className="spinner"></div></div>;
  if (!data) return <div className="page-error">Failed to load dashboard data</div>;

  const { tasks, stats } = data;
  const overdueCount = stats.overdue || 0;

  const chartData = [
    { name: 'To Do', value: stats.byStatus?.TODO || 0, color: 'var(--text-3)' },
    { name: 'In Progress', value: stats.byStatus?.IN_PROGRESS || 0, color: 'var(--primary)' },
    { name: 'In Review', value: stats.byStatus?.IN_REVIEW || 0, color: 'var(--warning)' },
    { name: 'Done', value: stats.byStatus?.DONE || 0, color: 'var(--success)' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Here's an overview of your current workspace.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Layout size={24} /></div>
          <div className="stat-content">
            <span className="stat-value">{stats.total || 0}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--primary)' }}><Clock size={24} /></div>
          <div className="stat-content">
            <span className="stat-value">{stats.byStatus?.IN_PROGRESS || 0}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--success)' }}><CheckCircle2 size={24} /></div>
          <div className="stat-content">
            <span className="stat-value done">{stats.byStatus?.DONE || 0}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--danger)' }}><AlertCircle size={24} /></div>
          <div className="stat-content">
            <span className={`stat-value ${overdueCount > 0 ? 'overdue' : ''}`}>{overdueCount}</span>
            <span className="stat-label">Overdue</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2 className="card-title">Task Distribution</h2>
          <div style={{ height: '300px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--text-3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ background: 'var(--surface-high)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)' }} 
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Tasks</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className={`task-mini-item ${task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'overdue' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: task.status === 'DONE' ? 'var(--success)' : 'var(--text-3)' }}>
                    {task.status === 'DONE' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </div>
                  <div>
                    <span className="task-mini-title" style={{ textDecoration: task.status === 'DONE' ? 'line-through' : 'none', color: task.status === 'DONE' ? 'var(--text-2)' : 'var(--text)' }}>
                      {task.title}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span className="task-mini-project">{task.project.name}</span>
                      <span className={`status-badge status-${task.status}`}>{task.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="empty-state" style={{ padding: '40px 20px', border: 'none' }}>
                <p>No tasks found. Get started by creating a project!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
