import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, tasksApi } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, X, Users, Calendar, Trash2, Edit3, MessageSquare, Clock } from 'lucide-react';
import { format } from 'date-fns';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Task form state
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  // Comment form state
  const [commentText, setCommentText] = useState('');

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await projectsApi.getById(id);
      return res.data;
    }
  });

  const { data: membersList } = useQuery({
    queryKey: ['projectMembers', id],
    queryFn: async () => {
      const res = await projectsApi.getMembers(id);
      return res.data;
    },
    enabled: !!project
  });

  const createTask = useMutation({
    mutationFn: (data) => projectsApi.createTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      toast.success('Task created');
      setShowTaskModal(false);
      resetTaskForm();
    }
  });

  const updateTask = useMutation({
    mutationFn: ({ taskId, data }) => tasksApi.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      toast.success('Task updated');
      setSelectedTask(null);
      resetTaskForm();
    }
  });

  const updateStatus = useMutation({
    mutationFn: ({ taskId, status }) => tasksApi.updateStatus(taskId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] })
  });

  const addComment = useMutation({
    mutationFn: ({ taskId, text }) => tasksApi.addComment(taskId, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setCommentText('');
    }
  });

  const resetTaskForm = () => {
    setTitle(''); setDesc(''); setStatus('TODO'); setPriority('MEDIUM'); setDueDate('');
  };

  const openTaskModal = (task = null, colStatus = 'TODO') => {
    if (task) {
      setTitle(task.title); setDesc(task.description || ''); setStatus(task.status);
      setPriority(task.priority); setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setSelectedTask(task);
    } else {
      resetTaskForm();
      setStatus(colStatus);
      setSelectedTask(null);
    }
    setShowTaskModal(true);
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    const payload = { title, description: desc, status, priority, dueDate: dueDate || null };
    if (selectedTask) {
      updateTask.mutate({ taskId: selectedTask.id, data: payload });
    } else {
      createTask.mutate(payload);
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      const task = project.tasks.find(t => t.id === taskId);
      if (task && task.status !== newStatus) {
        updateStatus.mutate({ taskId, status: newStatus });
      }
    }
  };

  if (isLoading) return <div className="page-loading"><div className="spinner"></div></div>;
  if (!project) return <div className="page-error">Project not found</div>;

  const columns = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
  const getPriorityColor = (p) => {
    if (p === 'URGENT') return 'var(--danger)';
    if (p === 'HIGH') return 'var(--warning)';
    return 'var(--primary)';
  };

  return (
    <div className="page" style={{ height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title">{project.name}</h1>
            <span className={`status-badge status-TODO`} style={{ fontSize: '10px' }}>{project.status}</span>
          </div>
          <p className="project-desc-detail">{project.description}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setShowInviteModal(true)}>
            <Users size={16} /> Members
          </button>
          <button className="btn btn-primary" onClick={() => openTaskModal()}>
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      <div className="project-detail-layout">
        <div className="kanban-columns">
          {columns.map(col => {
            const colTasks = project.tasks?.filter(t => t.status === col) || [];
            return (
              <div 
                key={col} 
                className="kanban-column"
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, col)}
              >
                <div className="kanban-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`kanban-status-badge status-${col}`}>{col.replace('_', ' ')}</span>
                    <span className="kanban-count">{colTasks.length}</span>
                  </div>
                  <button className="btn btn-ghost btn-xs" onClick={() => openTaskModal(null, col)}>
                    <Plus size={14} />
                  </button>
                </div>
                
                <div className="kanban-cards">
                  {colTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="task-card"
                      draggable
                      onDragStart={e => handleDragStart(e, task.id)}
                      onClick={() => openTaskModal(task)}
                      style={{ borderTop: `3px solid ${getPriorityColor(task.priority)}` }}
                    >
                      <h4 className="task-card-title">{task.title}</h4>
                      {task.description && (
                        <p className="task-card-desc">{task.description.length > 60 ? task.description.substring(0, 60) + '...' : task.description}</p>
                      )}
                      <div className="task-card-footer">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: 'var(--text-3)' }}>{task.priority}</span>
                          {task.comments?.length > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-2)' }}>
                              <MessageSquare size={10} /> {task.comments.length}
                            </span>
                          )}
                        </div>
                        {task.dueDate && (
                          <span className="task-due" style={{ color: new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'var(--danger)' : 'var(--text-3)' }}>
                            {format(new Date(task.dueDate), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Modal (Create/Edit) */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedTask ? 'Edit Task' : 'Create Task'}</h2>
              <button className="modal-close" onClick={() => setShowTaskModal(false)}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex' }}>
              <div style={{ flex: 1 }}>
                <form className="modal-form" onSubmit={handleTaskSubmit}>
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea value={desc} onChange={e => setDesc(e.target.value)} rows="4" />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Status</label>
                      <select value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="IN_REVIEW">In Review</option>
                        <option value="DONE">Done</option>
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
                  </div>
                  
                  <div className="form-group">
                    <label>Due Date</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={createTask.isPending || updateTask.isPending}>
                      {(createTask.isPending || updateTask.isPending) ? <div className="btn-spinner" /> : (selectedTask ? 'Save Changes' : 'Create Task')}
                    </button>
                  </div>
                </form>

                {/* Comments Section for Existing Tasks */}
                {selectedTask && (
                  <div className="comments-section" style={{ padding: '0 24px 24px' }}>
                    <h4>Comments ({selectedTask.comments?.length || 0})</h4>
                    <div className="comments-list">
                      {selectedTask.comments?.map(c => (
                        <div key={c.id} className="comment-item">
                          <div className="comment-avatar">{c.user.name.charAt(0)}</div>
                          <div>
                            <div>
                              <span className="comment-author">{c.user.name}</span>
                              <span className="comment-time">{format(new Date(c.createdAt), 'MMM d, h:mm a')}</span>
                            </div>
                            <div className="comment-content">{c.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form className="comment-input" onSubmit={e => {
                      e.preventDefault();
                      if (commentText.trim()) addComment.mutate({ taskId: selectedTask.id, text: commentText });
                    }}>
                      <textarea placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} required />
                      <button type="submit" className="btn btn-secondary" disabled={addComment.isPending || !commentText.trim()}>Post</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Project Members</h2>
              <button className="modal-close" onClick={() => setShowInviteModal(false)}><X size={20} /></button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div className="members-list">
                {membersList?.map(m => (
                  <div key={m.id} className="member-item">
                    <div className="member-avatar">{m.user.name.charAt(0)}</div>
                    <div className="member-info">
                      <span className="member-name">{m.user.name}</span>
                      <span className="role-badge" style={{ fontSize: '9px', padding: '1px 4px' }}>{m.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
