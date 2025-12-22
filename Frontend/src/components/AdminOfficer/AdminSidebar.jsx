import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, DollarSign, Bell, LogOut, Scale, Briefcase, File, HelpCircle, Calendar, Radio, CheckSquare } from 'lucide-react';

const AdminSidebar = ({ unreadNotifications = 0, onNavigate }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
    };

    const handleNavigation = (path) => {
        navigate(path);
        if (onNavigate) onNavigate();
    };

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin' || location.pathname === '/admin/';
        }
        return location.pathname.startsWith(path);
    };

    const NavItem = ({ icon: Icon, label, path, badge }) => (
        <button
            onClick={() => handleNavigation(path)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full relative ${isActive(path)
                ? 'bg-orange-600 text-white'
                : 'text-orange-200 hover:text-white hover:bg-orange-800'
                }`}
        >
            <Icon className="w-5 h-5" />
            {label}
            {badge > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                </span>
            )}
        </button>
    );

    return (
        <div className="w-64 bg-orange-900 text-white flex flex-col h-screen fixed left-0 top-0">
            <div className="p-6 border-b border-orange-800">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Scale className="w-6 h-6 text-orange-400" />
                    Chamber Desk
                </h1>
                <p className="text-xs text-orange-400 mt-1">Admin Officer Portal</p>
            </div>

            <nav className="p-4 space-y-2 flex-1">
                <NavItem icon={Home} label="Home" path="/admin" />
                <NavItem icon={Users} label="Clients" path="/admin/clients" />
                <NavItem icon={Briefcase} label="Cases" path="/admin/cases" />
                <NavItem icon={CheckSquare} label="Tasks" path="/admin/tasks" />
                <NavItem icon={Calendar} label="Meetings" path="/admin/meetings" />
                <NavItem icon={Radio} label="Broadcasts" path="/admin/broadcast" />
                <NavItem icon={DollarSign} label="Funds" path="/admin/funds" />
                <NavItem icon={File} label="Documents" path="/admin/documents" />
            </nav>

            <div className="p-4 border-t border-orange-800 space-y-2">
                <button
                    onClick={() => handleNavigation('/admin/support')}
                    className="flex items-center gap-3 px-4 py-3 text-orange-200 hover:text-white hover:bg-orange-800 transition-colors w-full rounded-lg"
                >
                    <HelpCircle className="w-5 h-5" />
                    Reach Tech Support
                </button>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-orange-200 hover:text-red-400 transition-colors w-full rounded-lg"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
