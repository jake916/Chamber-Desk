import React from 'react';
import { MessageCircle } from 'lucide-react';

const FloatingChatButton = ({ onClick, unreadCount, primaryColor }) => {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-600 hover:bg-blue-700',
            shadow: 'shadow-blue-500/50',
            pulse: 'bg-blue-400'
        },
        purple: {
            bg: 'bg-purple-600 hover:bg-purple-700',
            shadow: 'shadow-purple-500/50',
            pulse: 'bg-purple-400'
        }
    };

    const colors = colorClasses[primaryColor] || colorClasses.blue;

    return (
        <div className="fixed bottom-6 right-6 z-40">
            <button
                onClick={onClick}
                className={`${colors.bg} text-white rounded-full p-4 shadow-lg ${colors.shadow} transition-all duration-300 hover:scale-110 relative group`}
                title="HOC-Manager Comments"
            >
                <MessageCircle className="w-6 h-6" />

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}

                {/* Pulse Animation for Unread */}
                {unreadCount > 0 && (
                    <span className={`absolute inset-0 ${colors.pulse} rounded-full animate-ping opacity-75`}></span>
                )}

                {/* Tooltip */}
                <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    HOC-Manager Discussion
                </span>
            </button>
        </div>
    );
};

export default FloatingChatButton;
