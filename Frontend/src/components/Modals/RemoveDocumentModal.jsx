import React from 'react';
import { Trash2 } from 'lucide-react';

const RemoveDocumentModal = ({ isOpen, onClose, onConfirm, documentName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Remove Document</h3>
                            <p className="text-sm text-gray-500">Remove from case library?</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">
                        This will remove "{documentName}" from the case library. The document will still exist in your documents.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RemoveDocumentModal;
