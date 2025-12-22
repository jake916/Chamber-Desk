import React, { useState } from 'react';
import { X, Users } from 'lucide-react';

const UpdateOpposingCounselModal = ({ isOpen, onClose, onSave, isLoading }) => {
    const [counselName, setCounselName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (counselName.trim()) {
            await onSave(counselName.trim());
            setCounselName(''); // Clear input after successful save
        }
    };

    const handleClose = () => {
        setCounselName('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Users size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Update Opposing Counsel</h3>
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
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Opposing Counsel Name *
                        </label>
                        <input
                            type="text"
                            value={counselName}
                            onChange={(e) => setCounselName(e.target.value)}
                            placeholder="Enter opposing counsel name"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                            required
                            disabled={isLoading}
                            autoFocus
                        />
                        <p className="text-xs text-gray-600 mt-2">
                            This will be added to the opposing counsel history
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
                            disabled={isLoading || !counselName.trim()}
                            className="flex-1 px-4 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Updating...' : 'Update Counsel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateOpposingCounselModal;
