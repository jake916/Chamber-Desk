import React from 'react';
import { Home, Users, DollarSign, Briefcase, File, Calendar, Radio, CheckSquare } from 'lucide-react';
import RoleSidebar from '../Shared/RoleSidebar';

const AdminSidebar = ({ unreadNotifications = 0, onNavigate }) => {
    const navigationItems = [
        { icon: Home, label: 'Home', path: '/admin' },
        { icon: Users, label: 'Clients', path: '/admin/clients' },
        { icon: Briefcase, label: 'Cases', path: '/admin/cases' },
        { icon: CheckSquare, label: 'Tasks', path: '/admin/tasks' },
        { icon: Calendar, label: 'Meetings', path: '/admin/meetings' },
        { icon: Radio, label: 'Broadcasts', path: '/admin/broadcast' },
        { icon: DollarSign, label: 'Funds', path: '/admin/funds' },
        { icon: File, label: 'Documents', path: '/admin/documents' }
    ];

    return (
        <RoleSidebar
            role="admin"
            navigationItems={navigationItems}
            unreadNotifications={unreadNotifications}
            onNavigate={onNavigate}
        />
    );
};

export default AdminSidebar;
