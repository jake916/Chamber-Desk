import React from 'react';
import { Plus, Users } from 'lucide-react';

const OpposingCounselSection = ({ opposingCounselHistory, onUpdateClick, formatDate }) => {
    // Helper function to get ordinal suffix
    const getOrdinal = (n) => {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    // If no history exists, show N/A with update button
    if (!opposingCounselHistory || opposingCounselHistory.length === 0) {
        return (
            <div>
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-semibold text-gray-700">Opposing Counsel (if known)</p>
                    <button
                        onClick={onUpdateClick}
                        className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" />
                        Update Counsel
                    </button>
                </div>
                <p className="text-sm text-gray-900">N/A</p>
            </div>
        );
    }

    // Get current counsel (last in array)
    const currentCounsel = opposingCounselHistory[opposingCounselHistory.length - 1];
    const hasHistory = opposingCounselHistory.length > 1;

    return (
        <>
            {/* Current Opposing Counsel */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-semibold text-gray-700">Opposing Counsel (if known)</p>
                    <button
                        onClick={onUpdateClick}
                        className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" />
                        Update Counsel
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">Current</span>
                    <p className="text-sm text-gray-900">{currentCounsel.name}</p>
                </div>
            </div>

            {/* Opposing Counsel History */}
            {hasHistory && (
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Opposing Counsel History</h3>
                    <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                        {[...opposingCounselHistory].reverse().slice(1).map((counsel, index) => {
                            // Calculate the counsel number (1st, 2nd, 3rd, etc.)
                            const originalIndex = opposingCounselHistory.length - index - 2;
                            const counselNumber = originalIndex + 1;
                            const label = getOrdinal(counselNumber);

                            return (
                                <div key={index} className="relative pl-10">
                                    <div className="absolute left-0 top-2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white">
                                        <Users className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                                {label} Opposing Counsel
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(counsel.dateAdded)}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">{counsel.name}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
};

export default OpposingCounselSection;
