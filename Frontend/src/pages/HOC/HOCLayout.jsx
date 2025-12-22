import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import HOCSidebar from '../../components/HOC/HOCSidebar';

const HOCLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Desktop (Fixed) */}
            <div className="hidden md:block fixed left-0 top-0 h-screen">
                <HOCSidebar />
            </div>

            {/* Sidebar - Mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}>
                    <div className="w-64 h-full" onClick={(e) => e.stopPropagation()}>
                        <div className="relative h-full">
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="absolute top-4 right-4 p-2 text-white hover:bg-purple-800 rounded-lg z-50"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <HOCSidebar onNavigate={() => setSidebarOpen(false)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content - Add left margin for fixed sidebar on desktop */}
            <div className="flex-1 md:ml-64">
                {/* Header - Mobile */}
                <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden">
                    <h1 className="font-bold text-lg">Chamber Desk</h1>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600">
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                {/* Content Area - Renders child routes */}
                <div className="min-h-screen">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default HOCLayout;
