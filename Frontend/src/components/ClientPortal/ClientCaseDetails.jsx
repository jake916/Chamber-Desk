import React from 'react';
import { FileText, Target, Users } from 'lucide-react';

const ClientCaseDetails = ({ caseData, formatDate }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Details</h3>

            <div className="space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <p className="font-semibold text-gray-700">Summary of Issue</p>
                    </div>
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{caseData.summary}</p>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-green-600" />
                        <p className="font-semibold text-gray-700">Your Objective</p>
                    </div>
                    <p className="text-gray-900 leading-relaxed">{caseData.clientObjective}</p>
                </div>

                {caseData.opposingCounselHistory && caseData.opposingCounselHistory.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Users className="w-5 h-5 text-purple-600" />
                            <p className="font-semibold text-gray-700">Opposing Counsel</p>
                        </div>

                        {/* Current Opposing Counsel */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">Current</span>
                            <p className="text-gray-900">{caseData.opposingCounselHistory[caseData.opposingCounselHistory.length - 1].name}</p>
                        </div>

                        {/* History */}
                        {caseData.opposingCounselHistory.length > 1 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-sm font-semibold text-gray-600">Previous Counsel</p>
                                {[...caseData.opposingCounselHistory].reverse().slice(1).map((counsel, index) => {
                                    const originalIndex = caseData.opposingCounselHistory.length - index - 2;
                                    const getOrdinal = (n) => {
                                        const s = ['th', 'st', 'nd', 'rd'];
                                        const v = n % 100;
                                        return n + (s[(v - 20) % 10] || s[v] || s[0]);
                                    };
                                    const counselNumber = originalIndex + 1;
                                    return (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                                {getOrdinal(counselNumber)}
                                            </span>
                                            <p className="text-gray-700">{counsel.name}</p>
                                            <span className="text-gray-500 text-xs">({formatDate(counsel.dateAdded)})</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientCaseDetails;
