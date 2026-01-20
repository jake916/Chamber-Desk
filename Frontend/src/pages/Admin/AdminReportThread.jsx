import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, User as UserIcon, FileText } from 'lucide-react';
import API_BASE_URL from '../../config/api';

const AdminReportThread = () => {
    const { caseId, reportId } = useParams();
    const navigate = useNavigate();
    const [caseData, setCaseData] = useState(null);
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReportData();
    }, [caseId, reportId]);

    const fetchReportData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
                headers: { 'x-auth-token': token }
            });

            if (response.ok) {
                const data = await response.json();
                setCaseData(data);
                const foundReport = data.clientReports.find(r => r._id === reportId);
                setReport(foundReport);
            }
        } catch (err) {
            console.error('Error fetching report:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Report not found</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(`/admin/cases/${caseId}`)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Case Details</span>
                </button>
                <h1 className="text-3xl font-bold text-gray-900">{caseData?.caseTitle}</h1>
                <p className="text-gray-600 mt-1">Client: {caseData?.client?.name}</p>
            </div>

            {/* Original Report */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-full">
                        <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">{report.subject}</h2>
                        <p className="text-sm text-gray-500">
                            Posted by {report.author?.name || 'Unknown'} • {formatDate(report.createdAt)}
                        </p>
                    </div>
                </div>
                <div className="pl-11">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{report.content}</p>
                </div>
            </div>

            {/* Conversation Thread */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        Discussion ({report.replies?.length || 0})
                    </h3>
                </div>

                {report.replies && report.replies.length > 0 ? (
                    <div className="space-y-4">
                        {report.replies.map((reply, index) => (
                            <div
                                key={index}
                                className={`flex gap-3 ${reply.authorType === 'client' ? 'flex-row' : 'flex-row-reverse'}`}
                            >
                                <div className={`p-2 rounded-full ${reply.authorType === 'client' ? 'bg-blue-100' : 'bg-green-100'}`}>
                                    <UserIcon className={`w-4 h-4 ${reply.authorType === 'client' ? 'text-blue-600' : 'text-green-600'}`} />
                                </div>
                                <div className={`flex-1 ${reply.authorType === 'client' ? 'text-left' : 'text-right'}`}>
                                    <div className={`inline-block max-w-[80%] p-3 rounded-lg ${reply.authorType === 'client'
                                            ? 'bg-blue-50 border border-blue-100'
                                            : 'bg-green-50 border border-green-100'
                                        }`}>
                                        <p className="text-xs font-semibold text-gray-700 mb-1">
                                            {reply.authorName}
                                            {reply.authorType === 'client' && ' (Client)'}
                                            {reply.authorType === 'hoc' && ' (HOC)'}
                                            {reply.authorType === 'lawyer' && ' (Lawyer)'}
                                            {reply.authorType === 'manager' && ' (Manager)'}
                                        </p>
                                        <p className="text-gray-800 whitespace-pre-wrap">{reply.content}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {formatDate(reply.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">No replies yet.</p>
                )}

                {/* View-Only Notice */}
                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800 text-center">
                        <strong>View Only:</strong> As an admin, you can view this conversation but cannot post replies.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminReportThread;
