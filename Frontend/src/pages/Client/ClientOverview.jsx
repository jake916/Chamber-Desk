import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Briefcase, Calendar, MessageSquare } from 'lucide-react';

const ClientOverview = () => {
    const { clientData, shareToken } = useOutletContext();
    const navigate = useNavigate();
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    const [showComplaintModal, setShowComplaintModal] = useState(false);

    const handleViewCases = () => {
        navigate(`/client-portal/${shareToken}/cases`);
    };

    const handleScheduleMeeting = () => {
        navigate(`/client-portal/${shareToken}/meetings`);
    };

    const handleDropComplaint = () => {
        navigate(`/client-portal/${shareToken}/complaints`);
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Welcome Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {clientData?.name}</h1>
                <p className="text-gray-600">Here's what's happening with your cases today.</p>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* View Cases */}
                <button
                    onClick={handleViewCases}
                    className="bg-purple-600 rounded-xl p-6 text-white shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105 text-left"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-purple-100 text-sm">Active Cases</p>
                            <h3 className="text-2xl font-bold">View Cases</h3>
                        </div>
                    </div>
                    <p className="text-sm text-purple-100 opacity-90">Check updates on your ongoing legal matters</p>
                </button>

                {/* Schedule Meeting */}
                <button
                    onClick={handleScheduleMeeting}
                    className="bg-blue-600 rounded-xl p-6 text-white shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 text-left"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm">Appointments</p>
                            <h3 className="text-2xl font-bold">Schedule Meeting</h3>
                        </div>
                    </div>
                    <p className="text-sm text-blue-100 opacity-90">Book appointments with your legal team</p>
                </button>

                {/* Drop Complaint */}
                <button
                    onClick={handleDropComplaint}
                    className="bg-orange-600 rounded-xl p-6 text-white shadow-lg hover:bg-orange-700 transition-all transform hover:scale-105 text-left"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-orange-100 text-sm">Have an issue?</p>
                            <h3 className="text-2xl font-bold">Drop a Complaint</h3>
                        </div>
                    </div>
                    <p className="text-sm text-orange-100 opacity-90">Submit a complaint or report an issue directly</p>
                </button>
            </div>

            {/* Info Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Assistance?</h2>
                <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                    If you have any questions about your cases or need to schedule a meeting, please contact our office directly or use the messaging feature within your specific case file.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium">
                    <span>Contact Support: support@chamberdesk.com</span>
                </div>
            </div>
        </div>
    );
};

export default ClientOverview;

