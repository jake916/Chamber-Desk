import React from 'react';
import { Home, FileText, DollarSign, FolderOpen, CheckSquare, Calendar, Radio, MessageSquare } from 'lucide-react';
import RoleSidebar from '../Shared/RoleSidebar';

const LawyerSidebar = ({ onNavigate }) => {
    const navigationItems = [
        { icon: Home, label: 'Home', path: '/lawyer' },
        { icon: FileText, label: 'Cases', path: '/lawyer/cases' },
        { icon: CheckSquare, label: 'Tasks', path: '/lawyer/tasks' },
        { icon: Calendar, label: 'Meetings', path: '/lawyer/meetings' },
        { icon: Radio, label: 'Broadcast', path: '/lawyer/broadcast' },
        { icon: DollarSign, label: 'Funds', path: '/lawyer/funds' },
        { icon: FolderOpen, label: 'Documents', path: '/lawyer/documents' },
        
    ];

    return (
        <RoleSidebar
            role="lawyer"
            navigationItems={navigationItems}
            onNavigate={onNavigate}
        />
    );
};

export default LawyerSidebar;
