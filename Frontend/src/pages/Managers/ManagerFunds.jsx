import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, User, Calendar, CheckCircle, XCircle, Clock, Send, Plus, Search, Filter, Eye, MessageCircle, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../../config/api';

const ManagerFunds = () => {
    const navigate = useNavigate();
    const [requisitions, setRequisitions] = useState([]);
    const [users, setUsers] = useState([]);
    const [managers, setManagers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewRequisition, setViewRequisition] = useState(null);

    // Get user role and ID
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user.role;
    const userId = user.id;

    // Assign modal
    const [selectedRequisition, setSelectedRequisition] = useState(null);
    const [selectedManager, setSelectedManager] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignMessage, setAssignMessage] = useState({ type: '', text: '' });

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterUser, setFilterUser] = useState('All');
    const [historyFilter, setHistoryFilter] = useState('All');
    const [historyPeriod, setHistoryPeriod] = useState('all');
    const [historyFromDate, setHistoryFromDate] = useState('');
    const [historyToDate, setHistoryToDate] = useState('');

    // Approve/Reject states
    const [isProcessing, setIsProcessing] = useState(false);
    const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

    // Query/Discussion states
    const [queryContent, setQueryContent] = useState('');
    const [discussionContent, setDiscussionContent] = useState('');
    const [showQueryModal, setShowQueryModal] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [closeReason, setCloseReason] = useState('');
    const [isSubmittingQuery, setIsSubmittingQuery] = useState(false);

    // PIN states
    const [hasApprovalPin, setHasApprovalPin] = useState(false);
    const [showPinCreationModal, setShowPinCreationModal] = useState(false);
    const [pinCreationData, setPinCreationData] = useState({
        email: '',
        pin: '',
        confirmPin: ''
    });
    const [pinCreationMessage, setPinCreationMessage] = useState({ type: '', text: '' });
    const [isCreatingPin, setIsCreatingPin] = useState(false);
    const [approvalPin, setApprovalPin] = useState('');

    useEffect(() => {
        fetchRequisitions();
        fetchUsers();
        fetchManagers();
        if (userRole === 'Manager') {
            checkApprovalPinStatus();
        }
    }, []);

    const fetchRequisitions = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/funds`, {
                headers: { 'x-auth-token': token }
            });

            if (response.ok) {
                const data = await response.json();
                setRequisitions(data);
            }
        } catch (err) {
            console.error('Error fetching requisitions:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
                headers: { 'x-auth-token': token }
            });

            if (response.ok) {
                const data = await response.json();
                const filteredUsers = data.filter(user =>
                    ['HOC', 'Lawyer', 'Admin Officer', 'Paralegal', 'Admin'].includes(user.role)
                );
                setUsers(filteredUsers);
            } else {
                console.error('Failed to fetch users, status:', response.status);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const fetchManagers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
                headers: { 'x-auth-token': token }
            });

            if (response.ok) {
                const data = await response.json();
                const managerUsers = data.filter(user => user.role === 'Manager');
                setManagers(managerUsers);
            } else {
                console.error('Failed to fetch managers, status:', response.status);
            }
        } catch (err) {
            console.error('Error fetching managers:', err);
        }
    };

    const checkApprovalPinStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/auth/has-approval-pin`, {
                headers: { 'x-auth-token': token }
            });

            if (response.ok) {
                const data = await response.json();
                setHasApprovalPin(data.hasPin);
            }
        } catch (err) {
            console.error('Error checking PIN status:', err);
        }
    };

    const handleCreatePin = async () => {
        if (!pinCreationData.email || !pinCreationData.pin || !pinCreationData.confirmPin) {
            setPinCreationMessage({ type: 'error', text: 'Please fill all fields' });
            return;
        }

        setIsCreatingPin(true);
        setPinCreationMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/auth/create-approval-pin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(pinCreationData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to create PIN');
            }

            setPinCreationMessage({ type: 'success', text: 'PIN created successfully!' });
            setTimeout(() => {
                setShowPinCreationModal(false);
                setPinCreationData({ email: '', pin: '', confirmPin: '' });
                setPinCreationMessage({ type: '', text: '' });
                setHasApprovalPin(true);
            }, 1500);

        } catch (err) {
            setPinCreationMessage({ type: 'error', text: err.message });
        } finally {
            setIsCreatingPin(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedManager) {
            setAssignMessage({ type: 'error', text: 'Please select a manager' });
            return;
        }

        setIsAssigning(true);
        setAssignMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/funds/${selectedRequisition._id}/assign`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ managerId: selectedManager })
            });

            if (!response.ok) {
                throw new Error('Failed to assign requisition');
            }

            setAssignMessage({ type: 'success', text: 'Requisition assigned successfully!' });
            setTimeout(() => {
                setSelectedRequisition(null);
                setSelectedManager('');
                setAssignMessage({ type: '', text: '' });
                fetchRequisitions();
            }, 1500);

        } catch (err) {
            setAssignMessage({ type: 'error', text: err.message });
        } finally {
            setIsAssigning(false);
        }
    };

    const handleApproveReject = async (status) => {
        // Validate PIN is provided
        if (!approvalPin) {
            setActionMessage({ type: 'error', text: 'Please enter your approval PIN' });
            return;
        }

        setIsProcessing(true);
        setActionMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/funds/${viewRequisition._id}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ status, pin: approvalPin })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.msg || 'Failed to process requisition');
            }

            setActionMessage({
                type: 'success',
                text: `Requisition ${status.toLowerCase()} successfully!`
            });

            setTimeout(() => {
                setViewRequisition(null);
                setActionMessage({ type: '', text: '' });
                setApprovalPin(''); // Clear PIN after use
                fetchRequisitions();
            }, 1500);

        } catch (err) {
            setActionMessage({ type: 'error', text: err.message });
            setApprovalPin(''); // Clear PIN on error
        } finally {
            setIsProcessing(false);
        }
    };

    const handleQuery = async () => {
        if (!queryContent.trim()) {
            setActionMessage({ type: 'error', text: 'Please enter a question' });
            return;
        }

        setIsSubmittingQuery(true);
        setActionMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/funds/${viewRequisition._id}/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ content: queryContent })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.msg || 'Failed to post query');
            }

            const data = await response.json();
            setViewRequisition(data.fundRequisition);
            setQueryContent('');
            setShowQueryModal(false);
            setActionMessage({ type: 'success', text: 'Query posted successfully!' });
            fetchRequisitions();

        } catch (err) {
            setActionMessage({ type: 'error', text: err.message });
        } finally {
            setIsSubmittingQuery(false);
        }
    };

    const handleDiscuss = async () => {
        if (!discussionContent.trim()) return;

        setIsSubmittingQuery(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/funds/${viewRequisition._id}/discuss`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ content: discussionContent })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.msg || 'Failed to post comment');
            }

            const data = await response.json();
            setViewRequisition(data.fundRequisition);
            setDiscussionContent('');
            fetchRequisitions();

        } catch (err) {
            setActionMessage({ type: 'error', text: err.message });
        } finally {
            setIsSubmittingQuery(false);
        }
    };

    const handleClose = async () => {
        if (!closeReason.trim()) {
            setActionMessage({ type: 'error', text: 'Please provide a closure reason' });
            return;
        }

        setIsSubmittingQuery(true);
        setActionMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/funds/${viewRequisition._id}/close`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ reason: closeReason })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.msg || 'Failed to close requisition');
            }

            setCloseReason('');
            setShowCloseModal(false);
            setActionMessage({ type: 'success', text: 'Requisition closed successfully!' });

            setTimeout(() => {
                setViewRequisition(null);
                setActionMessage({ type: '', text: '' });
                fetchRequisitions();
            }, 1500);

        } catch (err) {
            setActionMessage({ type: 'error', text: err.message });
        } finally {
            setIsSubmittingQuery(false);
        }
    };

    const handleReopen = async () => {
        setIsSubmittingQuery(true);
        setActionMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/funds/${viewRequisition._id}/reopen`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.msg || 'Failed to reopen requisition');
            }

            const data = await response.json();
            setViewRequisition(data.fundRequisition);
            setActionMessage({ type: 'success', text: 'Requisition reopened successfully!' });
            fetchRequisitions();

        } catch (err) {
            setActionMessage({ type: 'error', text: err.message });
        } finally {
            setIsSubmittingQuery(false);
        }
    };

    // Calculate stats
    const totalRequisitions = requisitions.length;
    const totalAmount = requisitions.reduce((sum, req) => sum + req.amount, 0);

    const approvedReqs = requisitions.filter(r => r.status === 'Approved');
    const approvedCount = approvedReqs.length;
    const approvedAmount = approvedReqs.reduce((sum, req) => sum + req.amount, 0);

    const pendingReqs = requisitions.filter(r => r.status === 'Pending');
    const pendingCount = pendingReqs.length;
    const pendingAmount = pendingReqs.reduce((sum, req) => sum + req.amount, 0);

    const assignedReqs = requisitions.filter(r => r.status === 'Assigned');
    const assignedCount = assignedReqs.length;
    const assignedAmount = assignedReqs.reduce((sum, req) => sum + req.amount, 0);

    const deniedReqs = requisitions.filter(r => r.status === 'Rejected');
    const deniedCount = deniedReqs.length;
    const deniedAmount = deniedReqs.reduce((sum, req) => sum + req.amount, 0);

    const queryingReqs = requisitions.filter(r => r.status === 'Querying');
    const queryingCount = queryingReqs.length;
    const queryingAmount = queryingReqs.reduce((sum, req) => sum + req.amount, 0);

    const closedReqs = requisitions.filter(r => r.status === 'Closed');
    const closedCount = closedReqs.length;
    const closedAmount = closedReqs.reduce((sum, req) => sum + req.amount, 0);

    // Filter requisitions for main list
    const filteredRequisitions = requisitions.filter(req => {
        const matchesSearch = req.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.requestedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'All' || req.status === filterStatus;
        const matchesUser = filterUser === 'All' || req.requestedBy?._id === filterUser;

        return matchesSearch && matchesStatus && matchesUser;
    });

    // For Manager role: separate assigned and other requisitions
    const assignedToMe = userRole === 'Manager' ? filteredRequisitions.filter(req =>
        req.assignedTo && (req.assignedTo._id === userId || req.assignedTo === userId)
    ) : [];

    const otherRequisitions = userRole === 'Manager' ? filteredRequisitions.filter(req =>
        !req.assignedTo || (req.assignedTo._id !== userId && req.assignedTo !== userId)
    ) : filteredRequisitions;

    // Filter for history
    const getHistoryRequisitions = () => {
        let filtered = requisitions.filter(req =>
            req.status === 'Approved' || req.status === 'Rejected'
        );

        if (historyFilter !== 'All') {
            filtered = filtered.filter(req => req.status === historyFilter);
        }

        // Apply period filter first
        if (historyPeriod !== 'all') {
            const now = new Date();
            filtered = filtered.filter(req => {
                const reqDate = new Date(req.updatedAt || req.createdAt);
                const diffTime = Math.abs(now - reqDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                switch (historyPeriod) {
                    case 'day':
                        return diffDays <= 1;
                    case 'week':
                        return diffDays <= 7;
                    case 'month':
                        return diffDays <= 30;
                    case 'year':
                        return diffDays <= 365;
                    default:
                        return true;
                }
            });
        }

        // Then apply date range
        if (historyFromDate) {
            filtered = filtered.filter(req => {
                const reqDate = new Date(req.updatedAt || req.createdAt);
                return reqDate >= new Date(historyFromDate);
            });
        }

        if (historyToDate) {
            filtered = filtered.filter(req => {
                const reqDate = new Date(req.updatedAt || req.createdAt);
                const toDate = new Date(historyToDate);
                toDate.setHours(23, 59, 59, 999);
                return reqDate <= toDate;
            });
        }

        return filtered;
    };

    const formatCurrency = (amount) => {
        return `₦${amount.toLocaleString()}`;
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const config = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Querying': 'bg-amber-100 text-amber-800',
            'Assigned': 'bg-blue-100 text-blue-800',
            'Approved': 'bg-green-100 text-green-800',
            'Rejected': 'bg-red-100 text-red-800',
            'Closed': 'bg-gray-100 text-gray-800'
        };
        return config[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Fund Requisitions</h2>
                {userRole !== 'Manager' && (
                    <button
                        onClick={() => navigate('/admin/funds/request')}
                        className="px-6 py-2.5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Request Funds
                    </button>
                )}
            </div>

            {/* PIN Creation Banner */}
            {userRole === 'Manager' && !hasApprovalPin && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-900">Approval PIN Required</h3>
                            <p className="text-sm text-amber-800 mt-1">
                                You need to create an approval PIN to approve or reject fund requisitions.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowPinCreationModal(true)}
                            className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 flex-shrink-0"
                        >
                            Create PIN
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Counter Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Requisitions</p>
                            <p className="text-2xl font-bold text-gray-900">{totalRequisitions}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatCurrency(totalAmount)}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Approved</p>
                            <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatCurrency(approvedAmount)}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatCurrency(pendingAmount)}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Querying</p>
                            <p className="text-2xl font-bold text-amber-600">{queryingCount}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatCurrency(queryingAmount)}</p>
                        </div>
                        <div className="p-3 bg-amber-100 rounded-lg">
                            <MessageCircle className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Assigned</p>
                            <p className="text-2xl font-bold text-blue-600">{assignedCount}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatCurrency(assignedAmount)}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Send className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Denied</p>
                            <p className="text-2xl font-bold text-red-600">{deniedCount}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatCurrency(deniedAmount)}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Closed</p>
                            <p className="text-2xl font-bold text-gray-600">{closedCount}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatCurrency(closedAmount)}</p>
                        </div>
                        <div className="p-3 bg-gray-100 rounded-lg">
                            <XCircle className="w-6 h-6 text-gray-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by purpose or requester..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black appearance-none bg-white min-w-[180px]"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Querying">Querying</option>
                            <option value="Assigned">Assigned</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <select
                            value={filterUser}
                            onChange={(e) => setFilterUser(e.target.value)}
                            className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black appearance-none bg-white min-w-[200px]"
                        >
                            <option value="All">All Users ({users.length})</option>
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.name} ({user.role})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Manager View: Assigned to Me Section */}
            {userRole === 'Manager' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">Assigned to Me ({assignedToMe.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Purpose</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Requested By</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading...</td>
                                    </tr>
                                ) : assignedToMe.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No requisitions assigned to you</td>
                                    </tr>
                                ) : (
                                    assignedToMe.map((req) => (
                                        <tr key={req._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{formatCurrency(req.amount)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">{req.purpose}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.requestedBy?.name || 'Unknown'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(req.createdAt)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(req.status)}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => setViewRequisition(req)}
                                                    className="px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* All Requisitions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {userRole === 'Manager' ? `Other Requisitions (${otherRequisitions.length})` : 'All Requisitions'}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Purpose</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Requested By</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : otherRequisitions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        {userRole === 'Manager' ? 'No other requisitions' : 'No requisitions found'}
                                    </td>
                                </tr>
                            ) : (
                                otherRequisitions.map((req) => (
                                    <tr key={req._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{formatCurrency(req.amount)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">{req.purpose}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.requestedBy?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(req.createdAt)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setViewRequisition(req)}
                                                    className="px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                                {req.status === 'Pending' && userRole !== 'Manager' && (
                                                    <button
                                                        onClick={() => setSelectedRequisition(req)}
                                                        className="px-3 py-1.5 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700"
                                                    >
                                                        Assign
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Status Filter */}
                        <select
                            value={historyFilter}
                            onChange={(e) => setHistoryFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black text-sm"
                        >
                            <option value="All">All Transactions</option>
                            <option value="Approved">Approved Only</option>
                            <option value="Rejected">Denied Only</option>
                        </select>

                        {/* Period Filter */}
                        <select
                            value={historyPeriod}
                            onChange={(e) => setHistoryPeriod(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black text-sm"
                        >
                            <option value="all">All Time</option>
                            <option value="day">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>

                        {/* Date Range Filters */}
                        <div className="flex gap-2 col-span-1 lg:col-span-1">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">From:</label>
                                <input
                                    type="date"
                                    value={historyFromDate}
                                    onChange={(e) => setHistoryFromDate(e.target.value)}
                                    onClick={(e) => e.target.showPicker?.()}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black text-sm"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">To:</label>
                                <input
                                    type="date"
                                    value={historyToDate}
                                    onChange={(e) => setHistoryToDate(e.target.value)}
                                    onClick={(e) => e.target.showPicker?.()}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Purpose</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Requested By</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {getHistoryRequisitions().length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No transaction history</td>
                                </tr>
                            ) : (
                                getHistoryRequisitions().map((req) => (
                                    <tr key={req._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{formatCurrency(req.amount)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">{req.purpose}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.requestedBy?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(req.updatedAt || req.createdAt)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assign Modal */}
            {selectedRequisition && (
                <div className="fixed inset-0 bg-[#000000]/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">Assign Requisition</h3>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">Amount: <span className="font-semibold text-gray-900">{formatCurrency(selectedRequisition.amount)}</span></p>
                                <p className="text-sm text-gray-600">Purpose: <span className="text-gray-900">{selectedRequisition.purpose}</span></p>
                            </div>

                            {assignMessage.text && (
                                <div className={`mb-4 p-3 rounded ${assignMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    {assignMessage.text}
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Manager</label>
                                <select
                                    value={selectedManager}
                                    onChange={(e) => setSelectedManager(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black"
                                >
                                    <option value="">Choose a manager...</option>
                                    {managers.map((manager) => (
                                        <option key={manager._id} value={manager._id}>
                                            {manager.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={() => {
                                    setSelectedRequisition(null);
                                    setSelectedManager('');
                                    setAssignMessage({ type: '', text: '' });
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={isAssigning || !selectedManager}
                                className="flex-1 px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50"
                            >
                                {isAssigning ? 'Assigning...' : 'Assign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Requisition Modal */}
            {viewRequisition && (
                <div className="fixed inset-0 bg-[#000000]/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[100vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-start">
                                <h3 className="text-2xl font-bold text-gray-900">Requisition Details</h3>
                                <button
                                    onClick={() => setViewRequisition(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {/* Amount - Full Width */}
                            <div className="bg-orange-50 p-4 rounded-lg mb-4">
                                <p className="text-sm text-gray-600 mb-1">Amount Requested</p>
                                <p className="text-3xl font-bold text-orange-600">{formatCurrency(viewRequisition.amount)}</p>
                            </div>

                            {/* 2-Column Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Status */}
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
                                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(viewRequisition.status)}`}>
                                        {viewRequisition.status}
                                    </span>
                                </div>

                                {/* Assigned Manager */}
                                {viewRequisition.assignedTo && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Assigned Manager</p>
                                        <p className="text-gray-900">{viewRequisition.assignedTo.name || 'Unknown'}</p>
                                        {viewRequisition.assignedTo.email && (
                                            <p className="text-sm text-gray-600">{viewRequisition.assignedTo.email}</p>
                                        )}
                                        {viewRequisition.assignedTo.role && (
                                            <p className="text-xs text-gray-500 mt-1">Role: {viewRequisition.assignedTo.role}</p>
                                        )}
                                    </div>
                                )}

                                {/* Requisition Type */}
                                {viewRequisition.type && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Requisition Type</p>
                                        <p className="text-gray-900">{viewRequisition.type}</p>
                                    </div>
                                )}

                                {/* Urgency */}
                                {viewRequisition.urgency && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Urgency Level</p>
                                        <p className="text-gray-900">{viewRequisition.urgency}</p>
                                    </div>
                                )}

                                {/* Requested By */}
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Requested By</p>
                                    <p className="text-gray-900">{viewRequisition.requestedBy?.name || 'Unknown'}</p>
                                    {viewRequisition.requestedBy?.email && (
                                        <p className="text-sm text-gray-600">{viewRequisition.requestedBy.email}</p>
                                    )}
                                </div>

                                {/* Date Requested */}
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Date Requested</p>
                                    <p className="text-gray-900">{formatDate(viewRequisition.createdAt)}</p>
                                </div>

                                {/* Related Case */}
                                {viewRequisition.caseId && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Related Case</p>
                                        <p className="text-gray-900">{viewRequisition.caseId.caseTitle || viewRequisition.caseId._id}</p>
                                    </div>
                                )}

                                {/* Related Client */}
                                {viewRequisition.clientId && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Related Client</p>
                                        <p className="text-gray-900">{viewRequisition.clientId.name || 'Unknown'}</p>
                                        {viewRequisition.clientId.email && (
                                            <p className="text-sm text-gray-600">{viewRequisition.clientId.email}</p>
                                        )}
                                    </div>
                                )}

                                {/* Last Updated */}
                                {viewRequisition.updatedAt && viewRequisition.updatedAt !== viewRequisition.createdAt && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Last Updated</p>
                                        <p className="text-gray-900">{formatDate(viewRequisition.updatedAt)}</p>
                                    </div>
                                )}
                            </div>

                            {/* Purpose - Full Width */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Purpose</p>
                                <p className="text-gray-900 whitespace-pre-wrap">{viewRequisition.purpose}</p>
                            </div>
                        </div>

                        {/* Closure Reason */}
                        {viewRequisition.closureReason && (
                            <div className="p-6 border-t border-gray-200 bg-red-50">
                                <p className="text-sm font-medium text-red-900 mb-2">Closure Reason</p>
                                <p className="text-red-800 whitespace-pre-wrap">{viewRequisition.closureReason}</p>
                            </div>
                        )}

                        {/* Discussion Thread */}
                        {viewRequisition.discussions && viewRequisition.discussions.length > 0 && (
                            <div className="p-6 border-t border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Discussion Thread</h4>
                                <div className="space-y-4 mb-4">
                                    {viewRequisition.discussions.map((discussion, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <p className="font-semibold text-gray-900">
                                                            {discussion.author?.name || 'Unknown'}
                                                        </p>
                                                        <span className="text-xs text-gray-500">
                                                            {discussion.author?.role}
                                                        </span>
                                                        <span className="text-xs text-gray-400">•</span>
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(discussion.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-800 whitespace-pre-wrap">{discussion.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Comment (Admin or assigned Manager, not for Closed status) */}
                                {((userRole === 'Admin') || (userRole === 'Manager' && viewRequisition.assignedTo && (viewRequisition.assignedTo._id === userId || viewRequisition.assignedTo === userId))) && viewRequisition.status !== 'Closed' && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Add Comment
                                        </label>
                                        <textarea
                                            value={discussionContent}
                                            onChange={(e) => setDiscussionContent(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black resize-none"
                                            rows="3"
                                            placeholder="Type your comment here..."
                                        />
                                        <button
                                            onClick={handleDiscuss}
                                            disabled={isSubmittingQuery || !discussionContent.trim()}
                                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {isSubmittingQuery ? 'Posting...' : 'Post Comment'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="p-6 border-t border-gray-200">
                            {actionMessage.text && (
                                <div className={`mb-4 p-3 rounded ${actionMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    {actionMessage.text}
                                </div>
                            )}

                            {/* Admin Action Buttons */}
                            {userRole === 'Admin' ? (
                                <div className="flex gap-3 flex-wrap">
                                    <button
                                        onClick={() => setViewRequisition(null)}
                                        className="flex-1 min-w-[120px] px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
                                    >
                                        Close
                                    </button>

                                    {viewRequisition.status === 'Pending' && (
                                        <>
                                            <button
                                                onClick={() => setShowQueryModal(true)}
                                                className="flex-1 min-w-[120px] px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700"
                                            >
                                                Query
                                            </button>
                                            <button
                                                onClick={() => setSelectedRequisition(viewRequisition)}
                                                className="flex-1 min-w-[120px] px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                                            >
                                                Assign to Manager
                                            </button>
                                        </>
                                    )}

                                    {viewRequisition.status === 'Querying' && (
                                        <button
                                            onClick={handleReopen}
                                            disabled={isSubmittingQuery}
                                            className="flex-1 min-w-[120px] px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {isSubmittingQuery ? 'Reopening...' : 'Reopen'}
                                        </button>
                                    )}

                                    {(viewRequisition.status === 'Pending' || viewRequisition.status === 'Querying') && (
                                        <button
                                            onClick={() => setShowCloseModal(true)}
                                            className="flex-1 min-w-[120px] px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
                                        >
                                            Close Requisition
                                        </button>
                                    )}
                                </div>
                            ) : userRole === 'Manager' &&
                                viewRequisition.assignedTo &&
                                (viewRequisition.assignedTo._id === userId || viewRequisition.assignedTo === userId) &&
                                viewRequisition.status === 'Assigned' ? (
                                <div>
                                    {/* PIN Input */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Approval PIN <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={approvalPin}
                                            onChange={(e) => setApprovalPin(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                                            placeholder="Enter your approval PIN"
                                            maxLength="6"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Enter your 4-6 digit approval PIN to approve or reject this requisition.
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApproveReject('Rejected')}
                                            disabled={isProcessing}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {isProcessing ? 'Processing...' : 'Reject'}
                                        </button>
                                        <button
                                            onClick={() => handleApproveReject('Approved')}
                                            disabled={isProcessing}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {isProcessing ? 'Processing...' : 'Accept'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setViewRequisition(null)}
                                    className="w-full px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Query Modal */}
            {showQueryModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">Query Requisition</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Ask a question about this requisition. The status will change to "Querying" and the requester will be notified.
                            </p>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Question <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={queryContent}
                                onChange={(e) => setQueryContent(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-black resize-none"
                                rows="4"
                                placeholder="Type your question here..."
                            />
                        </div>
                        <div className="p-6 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowQueryModal(false);
                                    setQueryContent('');
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleQuery}
                                disabled={isSubmittingQuery || !queryContent.trim()}
                                className="flex-1 px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50"
                            >
                                {isSubmittingQuery ? 'Posting...' : 'Post Query'}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            {/* PIN Creation Modal */}
            {
                showPinCreationModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900">Create Approval PIN</h3>
                            </div>
                            <div className="p-6">
                                {pinCreationMessage.text && (
                                    <div className={`mb-4 p-3 rounded ${pinCreationMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                        {pinCreationMessage.text}
                                    </div>
                                )}

                                <p className="text-sm text-gray-600 mb-4">
                                    Create a 4-6 digit PIN that you'll use to approve or reject fund requisitions.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={pinCreationData.email}
                                            onChange={(e) => setPinCreationData({ ...pinCreationData, email: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-black"
                                            placeholder="Enter your email"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            PIN (4-6 digits) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={pinCreationData.pin}
                                            onChange={(e) => setPinCreationData({ ...pinCreationData, pin: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-black"
                                            placeholder="Enter 4-6 digit PIN"
                                            maxLength="6"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm PIN <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={pinCreationData.confirmPin}
                                            onChange={(e) => setPinCreationData({ ...pinCreationData, confirmPin: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-black"
                                            placeholder="Confirm your PIN"
                                            maxLength="6"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowPinCreationModal(false);
                                        setPinCreationData({ email: '', pin: '', confirmPin: '' });
                                        setPinCreationMessage({ type: '', text: '' });
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreatePin}
                                    disabled={isCreatingPin}
                                    className="flex-1 px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50"
                                >
                                    {isCreatingPin ? 'Creating...' : 'Create PIN'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Close Requisition Modal */}
            {
                showCloseModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900">Close Requisition</h3>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-600 mb-4">
                                    Provide a reason for closing this requisition. The requester will be notified.
                                </p>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Closure Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={closeReason}
                                    onChange={(e) => setCloseReason(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black resize-none"
                                    rows="4"
                                    placeholder="Explain why this requisition is being closed..."
                                />
                            </div>
                            <div className="p-6 border-t border-gray-200 flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowCloseModal(false);
                                        setCloseReason('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClose}
                                    disabled={isSubmittingQuery || !closeReason.trim()}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {isSubmittingQuery ? 'Closing...' : 'Close Requisition'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ManagerFunds;
