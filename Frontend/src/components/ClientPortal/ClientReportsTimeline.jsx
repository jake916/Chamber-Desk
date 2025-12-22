import React from 'react';
import { FileText, MessageCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientReportsTimeline = ({ clientReports, formatDate, shareToken, caseId }) => {
    const navigate = useNavigate();

    if (!clientReports || clientReports.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Case Updates</h3>
                </div>
                <p className="text-gray-600">No updates available yet. Your attorney will post updates here.</p>
            </div>
        );
    }

    const truncateText = (text, maxLength = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Case Updates</h3>
            </div>

            <div className="space-y-3">
                {[...clientReports].reverse().map((report) => (
                    <div
                        key={report._id}
                        onClick={() => navigate(`/client-portal/${shareToken}/case/${caseId}/report/${report._id}`)}
                        className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                                    {report.subject}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatDate(report.createdAt)} • {report.author?.name || 'Attorney'}
                                </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                        </div>

                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                            {truncateText(report.content)}
                        </p>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
                                <MessageCircle className="w-3 h-3" />
                                <span>{report.replies?.length || 0} {report.replies?.length === 1 ? 'reply' : 'replies'}</span>
                            </div>
                            <span className="text-xs text-green-600 font-medium group-hover:underline">
                                View Discussion →
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClientReportsTimeline;
