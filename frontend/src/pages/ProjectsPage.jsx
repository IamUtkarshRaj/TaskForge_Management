import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FolderOpen, Plus, Users, Calendar, AlertCircle, X } from 'lucide-react';
import { format } from 'date-fns';

const ProjectsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await projectsApi.getAll();
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created');
      setShowModal(false);
      setName('');
      setDescription('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to create project');
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({ name, description });
  };

  if (isLoading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your team's workspaces and initiatives.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {projects?.length === 0 ? (
        <div className="empty-state">
          <FolderOpen className="empty-icon" />
          <h3>No projects found</h3>
          <p>Get started by creating your first project.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <Link to={`/projects/${project.id}`} key={project.id} className="project-card">
              <div className="project-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="project-avatar">{project.name.charAt(0).toUpperCase()}</div>
                  <h3 className="project-name">{project.name}</h3>
                </div>
              </div>
              <p className="project-desc">{project.description || 'No description provided.'}</p>
              
              <div className="project-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} /> {project.members?.length || 1}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} /> {format(new Date(project.createdAt), 'MMM d, yyyy')}
                </span>
                {project.status === 'ARCHIVED' && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)' }}>
                    <AlertCircle size={14} /> Archived
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form className="modal-form" onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required autoFocus placeholder="e.g. Q3 Marketing Campaign" />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" placeholder="Briefly describe what this project is about..." />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <div className="btn-spinner" /> : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
