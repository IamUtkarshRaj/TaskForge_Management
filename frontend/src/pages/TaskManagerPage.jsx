import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api';
import toast from 'react-hot-toast';
import { CheckCircle2, Circle, Clock, AlertCircle, Search } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const TaskManagerPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL'); // ALL, TODO, IN_PROGRESS, DONE
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data, isLoading } = useQuery({
    queryKey: ['myTasks', filter, priorityFilter, debouncedSearch],
    queryFn: async () => {
      const res = await tasksApi.getMyTasks({
        status: filter,
        priority: priorityFilter,
        search: debouncedSearch
      });
      return res.data;
    }
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => tasksApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
      toast.success('Task status updated');
    },
  });

  if (isLoading) return <div className="page-loading"><div className="spinner"></div></div>;

  const filteredTasks = data || [];
  
  const overdueTasks = filteredTasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)) && t.status !== 'DONE');
  const todayTasks = filteredTasks.filter(t => t.dueDate && isToday(new Date(t.dueDate)) && t.status !== 'DONE');
  const upcomingTasks = filteredTasks.filter(t => t.dueDate && !isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)) && t.status !== 'DONE');
  const completedTasks = filteredTasks.filter(t => t.status === 'DONE');
  const noDateTasks = filteredTasks.filter(t => !t.dueDate && t.status !== 'DONE');

  const toggleTaskStatus = (task) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    updateStatus.mutate({ id: task.id, status: newStatus });
  };

  const TaskRow = ({ task }) => (
    <div className={`task-mini-item ${task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'DONE' ? 'overdue' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          onClick={() => toggleTaskStatus(task)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: task.status === 'DONE' ? 'var(--success)' : 'var(--text-3)' }}
        >
          {task.status === 'DONE' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>
        <div>
          <span className="task-mini-title" style={{ textDecoration: task.status === 'DONE' ? 'line-through' : 'none', color: task.status === 'DONE' ? 'var(--text-2)' : 'var(--text)' }}>
            {task.title}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span className="task-mini-project">{task.project.name}</span>
            <span className={`priority-badge`} style={{ background: 'var(--surface-highest)', color: 'var(--text-2)', fontSize: '10px' }}>{task.priority}</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {task.dueDate && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontFamily: 'JetBrains Mono', color: isPast(new Date(task.dueDate)) && task.status !== 'DONE' ? 'var(--danger)' : 'var(--text-2)' }}>
            <Clock size={12} /> {format(new Date(task.dueDate), 'MMM d, h:mm a')}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Task Manager</h1>
          <p className="page-subtitle">Good morning, {user?.name.split(' ')[0]} 👋</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: 'var(--surface-high)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px 8px 36px', color: 'var(--text)', fontSize: '13px', width: '220px' }}
            />
          </div>
          <select 
            className="select" 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ width: '130px', padding: '8px', fontSize: '12px' }}
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <div className="status-selector" style={{ marginBottom: 0 }}>
            {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map(status => (
              <button key={status} className={`status-option ${filter === status ? 'active' : ''}`} onClick={() => setFilter(status)}>
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-grid has-sidebar">
        <div>
          {overdueTasks.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <AlertCircle size={16} color="var(--danger)" />
                <h3 style={{ fontFamily: 'Sora', fontSize: '14px', fontWeight: '600' }}>Overdue <span className="overdue-badge">{overdueTasks.length}</span></h3>
              </div>
              <div>{overdueTasks.map(t => <TaskRow key={t.id} task={t} />)}</div>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontFamily: 'Sora', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Due Today <span style={{ background: 'var(--warning-dim)', color: 'var(--warning)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', marginLeft: '8px' }}>{todayTasks.length}</span></h3>
            {todayTasks.length === 0 ? <p style={{ color: 'var(--text-3)', fontSize: '13px' }}>No tasks due today.</p> : todayTasks.map(t => <TaskRow key={t.id} task={t} />)}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontFamily: 'Sora', fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-2)' }}>Upcoming</h3>
            {upcomingTasks.map(t => <TaskRow key={t.id} task={t} />)}
            {noDateTasks.map(t => <TaskRow key={t.id} task={t} />)}
          </div>

          {filter === 'ALL' && completedTasks.length > 0 && (
            <div>
              <h3 style={{ fontFamily: 'Sora', fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-3)' }}>Completed Recently</h3>
              {completedTasks.slice(0, 5).map(t => <TaskRow key={t.id} task={t} />)}
            </div>
          )}
        </div>

        <div>
          <div className="card" style={{ position: 'sticky', top: '24px' }}>
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Today's Focus</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px 0' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '8px solid var(--surface-highest)', borderTopColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontFamily: 'Sora', fontSize: '24px', fontWeight: '700' }}>{completedTasks.length}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-2)' }}>Done Today</span>
              </div>
            </div>
            
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-3)', fontFamily: 'JetBrains Mono', marginBottom: '12px' }}>Tags</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['frontend', 'bugfix', 'review', 'design'].map(tag => (
                  <span key={tag} style={{ background: 'var(--surface-high)', color: 'var(--text-2)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', border: '1px solid var(--border-subtle)' }}>#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManagerPage;
