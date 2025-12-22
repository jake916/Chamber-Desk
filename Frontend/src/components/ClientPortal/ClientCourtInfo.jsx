import React from 'react';
import { Building, Calendar, User as UserIcon, FileText } from 'lucide-react';

const ClientCourtInfo = ({ caseData, formatDate }) => {
    if (!caseData.inCourt || !caseData.courtInfo || caseData.courtInfo.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Building className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Court Information</h3>
                </div>
                <p className="text-gray-600">This case is not currently in court.</p>
            </div>
        );
    }

    const currentCourt = caseData.courtInfo[caseData.courtInfo.length - 1];
    const hasHistory = caseData.courtInfo.length > 1;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <Building className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Court Information</h3>
            </div>

            {/* Current Court Info */}
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-orange-600 text-white text-xs font-semibold rounded">Current</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Court Name</p>
                        <p className="font-semibold text-gray-900">{currentCourt.courtName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-semibold text-gray-900">{currentCourt.courtLocation}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Case Number</p>
                        <p className="font-semibold text-gray-900">{currentCourt.caseNumber}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Presiding Judge</p>
                        <p className="font-semibold text-gray-900">{currentCourt.presidingJudge}</p>
                    </div>
                    {currentCourt.nextCourtDate && (
                        <div>
                            <p className="text-sm text-gray-600">Next Court Date</p>
                            <p className="font-semibold text-gray-900">{formatDate(currentCourt.nextCourtDate)}</p>
                        </div>
                    )}
                </div>

                {currentCourt.previousOrders && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-1">Previous Orders</p>
                        <p className="text-gray-900 whitespace-pre-wrap">{currentCourt.previousOrders}</p>
                    </div>
                )}
            </div>

            {/* Court History */}
            {hasHistory && (
                <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Court History</h4>
                    <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                        {[...caseData.courtInfo].reverse().slice(1).map((court, index) => (
                            <div key={index} className="relative pl-10">
                                <div className="absolute left-0 top-2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white">
                                    <Building className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-semibold text-gray-900">{court.courtName}</p>
                                            <p className="text-sm text-gray-600">{court.courtLocation}</p>
                                        </div>
                                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                                            {formatDate(court.dateAdded)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                        {court.caseNumber && (
                                            <div>
                                                <p className="text-xs text-gray-500">Case Number</p>
                                                <p className="text-sm font-medium text-gray-900">{court.caseNumber}</p>
                                            </div>
                                        )}
                                        {court.presidingJudge && (
                                            <div>
                                                <p className="text-xs text-gray-500">Presiding Judge</p>
                                                <p className="text-sm font-medium text-gray-900">{court.presidingJudge}</p>
                                            </div>
                                        )}
                                        {court.nextCourtDate && (
                                            <div>
                                                <p className="text-xs text-gray-500">Next Court Date</p>
                                                <p className="text-sm font-medium text-gray-900">{formatDate(court.nextCourtDate)}</p>
                                            </div>
                                        )}
                                    </div>

                                    {court.previousOrders && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1">Previous Orders</p>
                                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{court.previousOrders}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientCourtInfo;
