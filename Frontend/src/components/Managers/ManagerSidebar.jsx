import React from 'react';
import { Home, Users, FileText, CheckSquare, Calendar, Radio, DollarSign, FolderOpen } from 'lucide-react';
import RoleSidebar from '../Shared/RoleSidebar';

const ManagerSidebar = ({ onNavigate }) => {
    const navigationItems = [
        { icon: Home, label: 'Home', path: '/manager' },
        { icon: Users, label: 'Clients', path: '/manager/clients' },
        { icon: FileText, label: 'Cases', path: '/manager/cases' },
        { icon: CheckSquare, label: 'Tasks', path: '/manager/tasks' },
        { icon: Calendar, label: 'Meetings', path: '/manager/meetings' },
        { icon: Radio, label: 'Broadcasts', path: '/manager/broadcasts' },
        { icon: DollarSign, label: 'Funds', path: '/manager/funds' },
        { icon: FolderOpen, label: 'Documents', path: '/manager/documents' }
    ];

    return (
        <RoleSidebar
            role="manager"
            navigationItems={navigationItems}
            onNavigate={onNavigate}
        />
    );
};

export default ManagerSidebar;
