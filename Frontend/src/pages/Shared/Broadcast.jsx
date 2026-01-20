import React, { useState, useEffect } from 'react';
import { Radio, Calendar, User, X, MessageSquare, Plus } from 'lucide-react';
import LoadingSpinner from '../../components/AdminOfficer/LoadingSpinner';
import API_BASE_URL from '../../config/api';

const Broadcast = () => {
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user.role || 'Admin';
    const userId = user.id;
    const rolePrefix = userRole === 'HOC' ? '/hoc' : userRole === 'Manager' ? '/manager' : userRole === 'Lawyer' ? '/lawyer' : userRole === 'Paralegal' ? '/paralegal' : '/admin';
    const primaryColor = userRole === 'HOC' ? 'purple' : userRole === 'Manager' ? 'blue' : userRole === 'Lawyer' ? 'green' : userRole === 'Paralegal' ? 'teal' : 'orange';

    const [broadcasts, setBroadcasts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBroadcast, setSelectedBroadcast] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: ''
    });

    // Separate broadcasts for Managers
    const myBroadcasts = broadcasts.filter(b => b.sender?._id === userId);
    const otherBroadcasts = broadcasts.filter(b => b.sender?._id !== userId);

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    const fetchBroadcasts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/broadcasts`, {
                headers: { 'x-auth-token': token }
            });
            if (response.ok) {
                const data = await response.json();
                setBroadcasts(data);
            }
        } catch (err) {
            console.error('Error fetching broadcasts:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBroadcastClick = (broadcast) => {
        setSelectedBroadcast(broadcast);
        setShowModal(true);
    };

    const handleCreateBroadcast = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.message.trim()) {
            alert('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/broadcasts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const newBroadcast = await response.json();
                setBroadcasts([newBroadcast, ...broadcasts]);
                setFormData({ title: '', message: '' });
                setShowCreateModal(false);
                alert('Broadcast sent successfully!');
            } else {
                const error = await response.json();
                alert(error.msg || 'Failed to create broadcast');
            }
        } catch (err) {
            console.error('Error creating broadcast:', err);
            alert('Failed to create broadcast');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderBroadcastCard = (broadcast) => (
        <div
            key={broadcast._id}
            onClick={() => handleBroadcastClick(broadcast)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-3">
                <h3 className={`text-lg font-semibold text-gray-900 group-hover:text-${primaryColor}-600 transition-colors`}>
                    {broadcast.title}
                </h3>
                <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                    <Calendar className="w-3 h-3" />
                    {new Date(broadcast.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </span>
            </div>
            <p className="text-gray-600 line-clamp-2 mb-4">
                {broadcast.message}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <User className="w-3 h-3" />
                <span>Sent by: {broadcast.sender?.name || 'Unknown Sender'}</span>
            </div>
        </div>
    );

    if (isLoading) return <LoadingSpinner message="Loading broadcasts..." />;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Radio className={`w-6 h-6 text-${primaryColor}-600`} />
                        Broadcast Messages
                    </h1>
                    <p className="text-gray-600 mt-1">View important announcements and updates from management</p>
                </div>

                {/* Create Broadcast Button - Manager, Admin, and HOC */}
                {['Manager', 'Admin', 'HOC'].includes(userRole) && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className={`flex items-center gap-2 px-4 py-2 bg-${primaryColor}-600 text-white rounded-lg hover:bg-${primaryColor}-700 transition-colors`}
                    >
                        <Plus className="w-5 h-5" />
                        Create Broadcast
                    </button>
                )}
            </div>

            {/* Manager, Admin, and HOC View - Two Sections */}
            {['Manager', 'Admin', 'HOC'].includes(userRole) ? (
                <div className="space-y-8">
                    {/* My Broadcasts Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                            My Broadcasts
                            <span className="text-sm font-normal text-gray-500">({myBroadcasts.length})</span>
                        </h2>
                        <div className="grid gap-4">
                            {myBroadcasts.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-gray-900">No Broadcasts Yet</h3>
                                    <p className="text-gray-500">You haven't created any broadcasts yet.</p>
                                </div>
                            ) : (
                                myBroadcasts.map(renderBroadcastCard)
                            )}
                        </div>
                    </div>

                    {/* All Broadcasts Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Radio className="w-5 h-5 text-blue-600" />
                            All Broadcasts
                            <span className="text-sm font-normal text-gray-500">({otherBroadcasts.length})</span>
                        </h2>
                        <div className="grid gap-4">
                            {otherBroadcasts.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                                    <Radio className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-gray-900">No Broadcasts</h3>
                                    <p className="text-gray-500">There are no broadcasts from other managers at this time.</p>
                                </div>
                            ) : (
                                otherBroadcasts.map(renderBroadcastCard)
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Non-Manager/Admin/HOC View - Single Section */
                <div className="grid gap-4">
                    {broadcasts.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                            <Radio className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">No Broadcasts</h3>
                            <p className="text-gray-500">There are no broadcast messages at this time.</p>
                        </div>
                    ) : (
                        broadcasts.map(renderBroadcastCard)
                    )}
                </div>
            )}

            {/* Broadcast Details Modal */}
            {showModal && selectedBroadcast && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedBroadcast.title}</h2>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        {selectedBroadcast.sender?.name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(selectedBroadcast.createdAt).toLocaleString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto max-h-[60vh]">
                            <div className="prose max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                                {selectedBroadcast.message}
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Broadcast Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-blue-50">
                            <h2 className="text-xl font-bold text-gray-900">Create New Broadcast</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateBroadcast} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter broadcast title"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        placeholder="Enter broadcast message"
                                        rows="8"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Broadcast'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Broadcast;
