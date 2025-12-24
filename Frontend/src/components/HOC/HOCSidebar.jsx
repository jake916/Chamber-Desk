import React from 'react';
import { Home, FileText, DollarSign, FolderOpen, Users, CheckSquare, Calendar, Radio } from 'lucide-react';
import RoleSidebar from '../Shared/RoleSidebar';

const HOCSidebar = ({ onNavigate }) => {
    const navigationItems = [
        { icon: Home, label: 'Home', path: '/hoc' },
        { icon: Users, label: 'Clients', path: '/hoc/clients' },
        { icon: FileText, label: 'Cases', path: '/hoc/cases' },
        { icon: CheckSquare, label: 'Tasks', path: '/hoc/tasks' },
        { icon: Calendar, label: 'Meetings', path: '/hoc/meetings' },
        { icon: Radio, label: 'Broadcast', path: '/hoc/broadcast' },
        { icon: DollarSign, label: 'Funds', path: '/hoc/funds' },
        { icon: FolderOpen, label: 'Documents', path: '/hoc/documents' }
    ];

    return (
        <RoleSidebar
            role="hoc"
            navigationItems={navigationItems}
            onNavigate={onNavigate}
        />
    );
};

export default HOCSidebar;
