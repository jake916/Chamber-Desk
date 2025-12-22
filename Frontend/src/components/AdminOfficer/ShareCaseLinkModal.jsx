import React, { useState } from 'react';
import { X, Copy, Check, Link as LinkIcon } from 'lucide-react';

const ShareCaseLinkModal = ({ isOpen, onClose, shareToken }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const shareUrl = `${window.location.origin}/case/${shareToken}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <LinkIcon size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Share Case with Client</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Shareable Link
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm"
                        />
                        <button
                            onClick={handleCopy}
                            className={`px-4 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 ${copied
                                    ? 'bg-green-600 text-white'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {copied ? (
                                <>
                                    <Check size={18} />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy size={18} />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-700">
                        <strong>First-time access:</strong> Client will verify their full name and create a 4-digit PIN.
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                        <strong>Returning access:</strong> Client will only need to enter their PIN.
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="w-full px-4 py-2.5 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default ShareCaseLinkModal;
