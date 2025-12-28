import React, { useState, useEffect } from 'react';
import { Bell, Calendar, CheckSquare, DollarSign, Upload, Users, Briefcase, Ticket, FileText, Radio, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import LoadingSpinner from '../../components/AdminOfficer/LoadingSpinner';

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalClients: 0,
        totalCases: 0,
        activeClients: 0,
        supportTickets: 0,
        fundRequisitions: 0,
        documents: 0
    });
    const [activities, setActivities] = useState({
        meetings: [],
        broadcasts: [],
        tasks: [],
        assignedRequisitions: []
    });
    const [recentData, setRecentData] = useState({
        cases: [],
        clients: [],
        requisitions: [],
        tickets: [],
        notifications: []
    });
    const [activeTab, setActiveTab] = useState('cases');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserName(user.name || 'Manager');
        fetchUnreadCount();
        fetchDashboardData();
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.count);
            }
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = user.id;

            // Fetch Clients
            const clientsRes = await fetch(`${API_BASE_URL}/api/clients`, {
                headers: { 'x-auth-token': token }
            });
            if (clientsRes.ok) {
                const clients = await clientsRes.json();
                const activeClients = clients.filter(c => c.status === 'Active').length;
                setStats(prev => ({
                    ...prev,
                    totalClients: clients.length,
                    activeClients
                }));
            }

            // Fetch Cases
            const casesRes = await fetch(`${API_BASE_URL}/api/cases`, {
                headers: { 'x-auth-token': token }
            });
            if (casesRes.ok) {
                const cases = await casesRes.json();
                setStats(prev => ({ ...prev, totalCases: cases.length }));
            }

            // Fetch Support Tickets (only tickets created by this manager)
            const ticketsRes = await fetch(`${API_BASE_URL}/api/support`, {
                headers: { 'x-auth-token': token }
            });
            if (ticketsRes.ok) {
                const tickets = await ticketsRes.json();
                // Filter tickets created by this manager
                const myTickets = tickets.filter(t =>
                    t.createdBy && (t.createdBy._id === userId || t.createdBy === userId)
                );
                setStats(prev => ({ ...prev, supportTickets: myTickets.length }));
            }

            // Fetch Fund Requisitions
            const fundsRes = await fetch(`${API_BASE_URL}/api/funds`, {
                headers: { 'x-auth-token': token }
            });
            if (fundsRes.ok) {
                const funds = await fundsRes.json();
                setStats(prev => ({ ...prev, fundRequisitions: funds.length }));
            }

            // Fetch Documents (uploaded by this manager)
            const docsRes = await fetch(`${API_BASE_URL}/api/documents`, {
                headers: { 'x-auth-token': token }
            });
            if (docsRes.ok) {
                const docs = await docsRes.json();
                // Filter documents uploaded by this manager
                const myDocs = docs.filter(doc =>
                    doc.uploadedBy && (doc.uploadedBy._id === userId || doc.uploadedBy === userId)
                );
                setStats(prev => ({ ...prev, documents: myDocs.length }));
            }

            // Fetch Meetings (upcoming meetings)
            const meetingsRes = await fetch(`${API_BASE_URL}/api/meetings`, {
                headers: { 'x-auth-token': token }
            });
            if (meetingsRes.ok) {
                const meetings = await meetingsRes.json();
                const now = new Date();
                const upcomingMeetings = meetings
                    .filter(m => {
                        const isFuture = new Date(m.date) > now;
                        const isCreator = m.createdBy && (m.createdBy._id === userId || m.createdBy === userId);
                        const isAttendee = m.attendees && m.attendees.some(att => att.email === user.email);
                        return isFuture && (isCreator || isAttendee);
                    })
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 5);
                setActivities(prev => ({ ...prev, meetings: upcomingMeetings }));
            }

            // Fetch Broadcasts (recent broadcasts)
            const broadcastsRes = await fetch(`${API_BASE_URL}/api/broadcasts`, {
                headers: { 'x-auth-token': token }
            });
            if (broadcastsRes.ok) {
                const broadcasts = await broadcastsRes.json();
                const recentBroadcasts = broadcasts
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5);
                setActivities(prev => ({ ...prev, broadcasts: recentBroadcasts }));
            }

            // Fetch Tasks (tasks due soon)
            const tasksRes = await fetch(`${API_BASE_URL}/api/tasks/my-tasks`, {
                headers: { 'x-auth-token': token }
            });
            if (tasksRes.ok) {
                const tasks = await tasksRes.json();
                const now = new Date();
                const tasksDueSoon = tasks
                    .filter(t => t.endDate && new Date(t.endDate) > now && t.status !== 'Completed')
                    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
                    .slice(0, 5);
                setActivities(prev => ({ ...prev, tasks: tasksDueSoon }));
            }

            // Fetch Assigned Requisitions (requisitions assigned to this manager)
            const assignedFundsRes = await fetch(`${API_BASE_URL}/api/funds`, {
                headers: { 'x-auth-token': token }
            });
            if (assignedFundsRes.ok) {
                const allFunds = await assignedFundsRes.json();
                // Filter for requisitions assigned to this manager
                const assignedToMe = allFunds
                    .filter(f => f.assignedTo && (f.assignedTo._id === userId || f.assignedTo === userId))
                    .filter(f => f.status === 'Assigned') // Only show pending ones
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5);
                setActivities(prev => ({ ...prev, assignedRequisitions: assignedToMe }));
            }

            // Fetch Recent Cases (all cases - managers can see all)
            const recentCasesRes = await fetch(`${API_BASE_URL}/api/cases`, {
                headers: { 'x-auth-token': token }
            });
            if (recentCasesRes.ok) {
                const cases = await recentCasesRes.json();
                const sortedCases = cases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
                setRecentData(prev => ({ ...prev, cases: sortedCases }));
            }

            // Fetch Recent Clients (all clients)
            const recentClientsRes = await fetch(`${API_BASE_URL}/api/clients`, {
                headers: { 'x-auth-token': token }
            });
            if (recentClientsRes.ok) {
                const clients = await recentClientsRes.json();
                const sortedClients = clients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
                setRecentData(prev => ({ ...prev, clients: sortedClients }));
            }

            // Fetch Recent Requisitions (all requisitions - managers can see all)
            const recentReqsRes = await fetch(`${API_BASE_URL}/api/funds`, {
                headers: { 'x-auth-token': token }
            });
            if (recentReqsRes.ok) {
                const reqs = await recentReqsRes.json();
                const sortedReqs = reqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
                setRecentData(prev => ({ ...prev, requisitions: sortedReqs }));
            }

            // Fetch Recent Tickets (only manager's own tickets)
            const recentTicketsRes = await fetch(`${API_BASE_URL}/api/support`, {
                headers: { 'x-auth-token': token }
            });
            if (recentTicketsRes.ok) {
                const tickets = await recentTicketsRes.json();
                const myTickets = tickets
                    .filter(t => t.createdBy && (t.createdBy._id === userId || t.createdBy === userId))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5);
                setRecentData(prev => ({ ...prev, tickets: myTickets }));
            }

            // Fetch Recent Notifications
            const recentNotifsRes = await fetch(`${API_BASE_URL}/api/notifications`, {
                headers: { 'x-auth-token': token }
            });
            if (recentNotifsRes.ok) {
                const notifs = await recentNotifsRes.json();
                const sortedNotifs = notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
                setRecentData(prev => ({ ...prev, notifications: sortedNotifs }));
            }

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        {
            title: 'Schedule Meeting',
            description: 'Set up a new meeting',
            icon: Calendar,
            path: '/manager/meetings',
            color: 'bg-purple-100',
            iconColor: 'text-purple-600'
        },
        {
            title: 'Add Task',
            description: 'Create a new task',
            icon: CheckSquare,
            path: '/manager/tasks',
            color: 'bg-blue-100',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Approve Funds',
            description: 'Review fund requisitions',
            icon: DollarSign,
            path: '/manager/funds',
            color: 'bg-green-100',
            iconColor: 'text-green-600'
        },
        {
            title: 'Upload Document',
            description: 'Upload new files',
            icon: Upload,
            path: '/manager/documents',
            color: 'bg-orange-100',
            iconColor: 'text-orange-600'
        }
    ];

    return (
        <div className='p-6'>
            {isLoading ? (
                <LoadingSpinner message="Loading dashboard data..." />
            ) : (
                <>
                    {/* Header Section */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                Welcome, Manager {userName}
                            </h1>
                            <p className="text-gray-600">
                                Here's an overview of what is happening in the chambers
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/manager/notifications')}
                                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                title="Notifications"
                            >
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center border-2 border-white px-1">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            <div className="text-right hidden md:block border border-gray-200 rounded p-3">
                                <p className="text-sm font-medium text-gray-900">
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Section */}
                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="text-green-600">⚡</span>
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => navigate(action.path)}
                                    className="flex items-start p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 group text-left"
                                >
                                    <div className={`p-3 rounded-lg ${action.color} mr-4 group-hover:scale-110 transition-transform`}>
                                        <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                                        <p className="text-sm text-gray-500">{action.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Statistics Cards - 3 Columns x 2 Rows */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Row 1 */}
                        {/* Total Clients */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Clients</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalClients}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        {/* Total Cases */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Cases</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalCases}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Briefcase className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        {/* Active Clients */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Active Clients</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.activeClients}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        {/* Row 2 */}
                        {/* Support Tickets */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Support Tickets</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.supportTickets}</p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-lg">
                                    <Ticket className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </div>

                        {/* Fund Requisitions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Fund Requisitions</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.fundRequisitions}</p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Documents</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.documents}</p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <FileText className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activities Section - 4 Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Upcoming Meetings */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-orange-600" />
                                    Upcoming Meetings
                                </h3>
                                <button
                                    onClick={() => navigate('/manager/meetings')}
                                    className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                                >
                                    View More <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {activities.meetings.length > 0 ? (
                                    activities.meetings.map((meeting, idx) => (
                                        <div key={idx} className="text-sm">
                                            <p className="font-medium text-gray-900">{meeting.title}</p>
                                            <p className="text-gray-500 text-xs">
                                                {new Date(meeting.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })} at {meeting.time}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No upcoming meetings</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Broadcasts */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Radio className="w-5 h-5 text-orange-600" />
                                    Recent Broadcasts
                                </h3>
                                <button
                                    onClick={() => navigate('/manager/broadcasts')}
                                    className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                                >
                                    View More <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {activities.broadcasts.length > 0 ? (
                                    activities.broadcasts.map((broadcast, idx) => (
                                        <div key={idx} className="text-sm">
                                            <p className="font-medium text-gray-900">{broadcast.title}</p>
                                            <p className="text-gray-500 text-xs">
                                                {new Date(broadcast.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No broadcasts yet</p>
                                )}
                            </div>
                        </div>

                        {/* My Tasks (Due Soon) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <CheckSquare className="w-5 h-5 text-orange-600" />
                                    My Tasks (Due Soon)
                                </h3>
                                <button
                                    onClick={() => navigate('/manager/tasks')}
                                    className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                                >
                                    View More <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {activities.tasks.length > 0 ? (
                                    activities.tasks.map((task, idx) => (
                                        <div key={idx} className="text-sm">
                                            <p className="font-medium text-gray-900">{task.name}</p>
                                            <p className="text-gray-500 text-xs">
                                                Due: {new Date(task.endDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No tasks due soon</p>
                                )}
                            </div>
                        </div>

                        {/* Requisitions (Assigned to Manager) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-orange-600" />
                                    Requisitions
                                </h3>
                                <button
                                    onClick={() => navigate('/manager/funds')}
                                    className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                                >
                                    View More <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {activities.assignedRequisitions.length > 0 ? (
                                    activities.assignedRequisitions.map((req, idx) => (
                                        <div key={idx} className="text-sm">
                                            <p className="font-medium text-gray-900">₦{req.amount?.toLocaleString()}</p>
                                            <p className="text-gray-500 text-xs">{req.purpose}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No pending requisitions</p>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* Recent Activity Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-orange-600" />
                                Recent Activity
                            </h2>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 overflow-x-auto">
                            {['cases', 'clients', 'requisitions', 'tickets', 'notifications'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap capitalize transition-colors ${activeTab === tab
                                        ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {/* Cases Tab */}
                            {activeTab === 'cases' && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-medium text-gray-700">Recent Cases</h3>
                                        <button
                                            onClick={() => navigate('/manager/cases')}
                                            className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                                        >
                                            View All <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {recentData.cases.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-8">No cases yet</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentData.cases.map((caseItem) => (
                                                <div
                                                    key={caseItem._id}
                                                    onClick={() => navigate(`/manager/cases/${caseItem._id}`)}
                                                    className="border-b border-gray-100 pb-3 last:border-0 cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-2 rounded transition-colors"
                                                >
                                                    <p className="text-sm font-medium text-gray-900">{caseItem.caseTitle}</p>
                                                    <p className="text-xs text-gray-600 line-clamp-1">{caseItem.summary}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(caseItem.createdAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className="text-xs text-gray-400">•</span>
                                                        <span className="text-xs text-blue-600">{caseItem.caseType}</span>
                                                        {caseItem.client?.name && (
                                                            <>
                                                                <span className="text-xs text-gray-400">•</span>
                                                                <span className="text-xs text-gray-600">{caseItem.client.name}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Clients Tab */}
                            {activeTab === 'clients' && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-medium text-gray-700">Recent Clients</h3>
                                        <button
                                            onClick={() => navigate('/manager/clients')}
                                            className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                                        >
                                            View All <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {recentData.clients.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-8">No clients yet</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentData.clients.map((client) => (
                                                <div
                                                    key={client._id}
                                                    onClick={() => navigate(`/manager/clients/${client._id}`)}
                                                    className="border-b border-gray-100 pb-3 last:border-0 cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-2 rounded transition-colors"
                                                >
                                                    <p className="text-sm font-medium text-gray-900">{client.name}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-xs text-gray-600">{client.email}</span>
                                                        {client.phone && (
                                                            <>
                                                                <span className="text-xs text-gray-400">•</span>
                                                                <span className="text-xs text-gray-600">{client.phone}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Requisitions Tab */}
                            {activeTab === 'requisitions' && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-medium text-gray-700">Recent Requisitions</h3>
                                        <button
                                            onClick={() => navigate('/manager/funds')}
                                            className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                                        >
                                            View All <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {recentData.requisitions.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-8">No requisitions yet</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentData.requisitions.map((req) => (
                                                <div
                                                    key={req._id}
                                                    className="border-b border-gray-100 pb-3 last:border-0"
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="text-sm font-medium text-gray-900">₦{req.amount?.toLocaleString()}</p>
                                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                            req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                                req.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {req.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 line-clamp-1">{req.purpose}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(req.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tickets Tab */}
                            {activeTab === 'tickets' && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-medium text-gray-700">Recent Tickets</h3>
                                        <button
                                            onClick={() => navigate('/manager/support')}
                                            className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                                        >
                                            View All <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {recentData.tickets.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-8">No tickets yet</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentData.tickets.map((ticket) => (
                                                <div
                                                    key={ticket._id}
                                                    className="border-b border-gray-100 pb-3 last:border-0"
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{ticket.title}</p>
                                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${ticket.status === 'Fixed' ? 'bg-green-100 text-green-800' :
                                                            ticket.status === 'Fixing' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {ticket.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-medium text-gray-700">Recent Notifications</h3>
                                        <button
                                            onClick={() => navigate('/manager/notifications')}
                                            className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                                        >
                                            View All <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {recentData.notifications.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-8">No notifications yet</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentData.notifications.map((notif) => (
                                                <div
                                                    key={notif._id}
                                                    className="border-b border-gray-100 pb-3 last:border-0"
                                                >
                                                    <p className="text-sm text-gray-900">{notif.message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(notif.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ManagerDashboard;
