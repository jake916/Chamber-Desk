import React from 'react';
import { Calendar, Briefcase, FileText } from 'lucide-react';

const ClientCaseOverview = ({ caseData, formatDate }) => {
    const getStatusColor = (status) => {
        const colors = {
            'Open': 'bg-green-100 text-green-800',
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Closed': 'bg-gray-100 text-gray-800',
            'Completed-Won': 'bg-emerald-100 text-emerald-800',
            'Completed-Lost': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{caseData.caseTitle}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Case Type</p>
                        <p className="font-semibold text-gray-900">{caseData.caseType}</p>
                        {caseData.subCategory && (
                            <p className="text-sm text-gray-600">{caseData.subCategory}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                        <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(caseData.status)}`}>
                            {caseData.status}
                        </span>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Date Started</p>
                        <p className="font-semibold text-gray-900">{formatDate(caseData.dateIssueStarted)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientCaseOverview;
