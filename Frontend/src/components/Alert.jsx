import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Alert = ({ type, message, onClose }) => {
    if (!message) return null;

    return (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            {type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm flex-1">{message}</p>
            {onClose && (
                <button
                    onClick={onClose}
                    className="ml-auto text-gray-400 hover:text-gray-600"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default Alert;
