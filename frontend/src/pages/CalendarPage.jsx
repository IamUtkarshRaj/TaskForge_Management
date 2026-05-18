import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, projectsApi } from '../api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const queryClient = useQueryClient();
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboardTasks'],
    queryFn: async () => {
      const res = await tasksApi.getDashboard();
      return res.data;
    }
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await projectsApi.getAll();
      return res.data;
    }
  });

  const createTask = useMutation({
    mutationFn: (taskData) => projectsApi.createTask(taskData.projectId, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardTasks'] });
      toast.success('Task created successfully');
      setShowModal(false);
      setTitle(''); setDesc(''); setProjectId(''); setPriority('MEDIUM');
    }
  });

  const handleDayClick = (day) => {
    setSelectedDate(format(day, 'yyyy-MM-dd'));
    setShowModal(true);
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (!projectId) return toast.error('Please select a project');
    createTask.mutate({ title, description: desc, priority, dueDate: selectedDate, projectId });
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  const goToday = () => setCurrentDate(new Date());

  if (isLoading) return <div className="page-loading"><div className="spinner"></div></div>;

  const tasks = data?.tasks || [];
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get padding days for start of month to align weeks
  const startPadding = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1; 
  const paddedDays = [...Array(startPadding).fill(null), ...days];

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'URGENT': return { bg: 'var(--danger-dim)', color: 'var(--danger)', border: 'var(--danger)' };
      case 'HIGH': return { bg: 'var(--warning-dim)', color: 'var(--warning)', border: 'var(--warning)' };
      case 'MEDIUM': return { bg: 'var(--primary-dim)', color: 'var(--primary)', border: 'var(--primary)' };
      default: return { bg: 'var(--surface-highest)', color: 'var(--text-2)', border: 'var(--border)' };
    }
  };

  return (
    <div className="page" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 className="page-title">{format(currentDate, 'MMMM yyyy')}</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={prevMonth}><ChevronLeft size={16} /></button>
            <button className="btn btn-secondary btn-sm" onClick={goToday}>Today</button>
            <button className="btn btn-secondary btn-sm" onClick={nextMonth}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--surface-high)', borderBottom: '1px solid var(--border)' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} style={{ padding: '10px', textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-3)', fontWeight: '500' }}>
              {d}
            </div>
          ))}
        </div>
        
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '1fr', background: 'var(--border)', gap: '1px' }}>
          {paddedDays.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} style={{ background: 'var(--bg)' }} />;
            
            const dayTasks = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day));
            
            return (
              <div 
                key={day.toString()} 
                onClick={() => handleDayClick(day)}
                style={{ 
                  background: isToday(day) ? 'var(--surface-high)' : 'var(--surface)', 
                  padding: '8px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '4px', 
                  borderTop: isToday(day) ? '2px solid var(--primary)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                className="calendar-day-hover"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <Plus size={12} style={{ opacity: 0.3 }} />
                  <div style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: isToday(day) ? '700' : '500', color: isToday(day) ? 'var(--primary)' : 'var(--text-2)' }}>
                    {format(day, 'd')}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
                  {dayTasks.slice(0, 3).map(task => {
                    const colors = getPriorityColor(task.priority);
                    return (
                      <div key={task.id} style={{ padding: '4px 6px', borderRadius: '4px', background: colors.bg, borderLeft: `2px solid ${colors.border}`, color: colors.color, fontSize: '10px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: task.status === 'DONE' ? 'line-through' : 'none', opacity: task.status === 'DONE' ? 0.6 : 1 }}>
                        {task.title}
                      </div>
                    )
                  })}
                  {dayTasks.length > 3 && (
                    <div style={{ fontSize: '10px', color: 'var(--text-3)', textAlign: 'center', padding: '2px' }}>
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Task for {format(new Date(selectedDate), 'MMM d, yyyy')}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            
            <form className="modal-form" onSubmit={handleTaskSubmit} style={{ padding: '20px 24px' }}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
              </div>
              
              <div className="form-group">
                <label>Project</label>
                <select value={projectId} onChange={e => setProjectId(e.target.value)} required>
                  <option value="">Select a project...</option>
                  {projectsData?.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createTask.isPending}>
                  {createTask.isPending ? <div className="btn-spinner" /> : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
