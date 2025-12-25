import React from 'react';
import { Home, FileText, DollarSign, FolderOpen, CheckSquare, Calendar, Radio, MessageSquare } from 'lucide-react';
import RoleSidebar from '../Shared/RoleSidebar';

const ParalegalSidebar = ({ onNavigate }) => {
    const navigationItems = [
        { icon: Home, label: 'Home', path: '/paralegal' },
        { icon: FileText, label: 'Cases', path: '/paralegal/cases' },
        { icon: CheckSquare, label: 'Tasks', path: '/paralegal/tasks' },
        { icon: Calendar, label: 'Meetings', path: '/paralegal/meetings' },
        { icon: Radio, label: 'Broadcast', path: '/paralegal/broadcast' },
        { icon: DollarSign, label: 'Funds', path: '/paralegal/funds' },
        { icon: FolderOpen, label: 'Documents', path: '/paralegal/documents' },

    ];

    return (
        <RoleSidebar
            role="paralegal"
            navigationItems={navigationItems}
            onNavigate={onNavigate}
        />
    );
};

export default ParalegalSidebar;
