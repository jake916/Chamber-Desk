import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Sidebar from '../../components/Superadmin/Sidebar';
import Home from './Home';
import ManageUsers from './ManageUsers';
import SuperadminSupportTickets from './SuperadminSupportTickets';
import SuperadminNotifications from './SuperadminNotifications';

const SuperadminDashboard = () => {
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content - with left margin to account for fixed sidebar */}
            <div className="md:ml-64 flex flex-col min-h-screen">
                {/* Header (Mobile only) */}
                <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden">
                    <h1 className="font-bold text-lg">Chamber Desk</h1>
                    <button onClick={handleLogout} className="p-2 text-gray-600">
                        <LogOut className="w-5 h-5" />
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/users" element={<ManageUsers />} />
                        <Route path="/support-tickets" element={<SuperadminSupportTickets />} />
                        <Route path="/notifications" element={<SuperadminNotifications />} />
                        <Route path="*" element={<Navigate to="/superadmin" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default SuperadminDashboard;

