import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, CheckSquare, FolderOpen, Calendar,
  Users, BarChart2, Shield, Settings, LogOut, Zap
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/task-manager', icon: CheckSquare, label: 'Task Manager' },
    { to: '/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/team', icon: Users, label: 'Team' },
    { to: '/reports', icon: BarChart2, label: 'Reports' },
    ...(user?.role === 'ADMIN' ? [{ to: '/admin', icon: Shield, label: 'Admin' }] : []),
  ];

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><Zap size={18} /></div>
          <span className="sidebar-logo-text">TaskForge</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">WORKSPACE</div>
        {navItems.slice(0, 3).map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}>
            <Icon size={16} className="sidebar-nav-icon" />
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: 16 }}>VIEWS</div>
        {navItems.slice(3, 6).map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}>
            <Icon size={16} className="sidebar-nav-icon" />
            <span>{label}</span>
          </NavLink>
        ))}

        {user?.role === 'ADMIN' && (
          <>
            <div className="sidebar-section-label" style={{ marginTop: 16 }}>ADMIN</div>
            <NavLink to="/admin" className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}>
              <Shield size={16} className="sidebar-nav-icon" />
              <span>Admin Panel</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}>
          <Settings size={16} className="sidebar-nav-icon" />
          <span>Settings</span>
        </NavLink>
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name}</span>
            <span className="sidebar-user-role">{user?.role}</span>
          </div>
          <button onClick={handleLogout} className="sidebar-logout" title="Logout">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
