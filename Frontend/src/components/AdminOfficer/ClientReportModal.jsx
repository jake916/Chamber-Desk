import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';

const ClientReportModal = ({ isOpen, onClose, onSave, isLoading }) => {
    const [subject, setSubject] = useState('');
    const [reportContent, setReportContent] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (subject.trim() && reportContent.trim()) {
            await onSave({ subject: subject.trim(), content: reportContent.trim() });
            setSubject('');
            setReportContent(''); // Clear after save
        }
    };

    const handleClose = () => {
        setSubject('');
        setReportContent('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <FileText size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Update Client Report</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Subject *
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g., Weekly Case Update"
                            className="w-full text-black px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Report Content *
                        </label>
                        <textarea
                            value={reportContent}
                            onChange={(e) => setReportContent(e.target.value)}
                            placeholder="Enter report details for the client..."
                            className="w-full px-4 text-black py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black resize-none"
                            rows="8"
                            required
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-600 mt-2">
                            This report will be visible to the client in their case portal
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !subject.trim() || !reportContent.trim()}
                            className="flex-1 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Posting...' : 'Post Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientReportModal;
