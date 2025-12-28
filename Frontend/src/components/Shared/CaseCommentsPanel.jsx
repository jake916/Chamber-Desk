import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User as UserIcon, Reply, AtSign } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const CaseCommentsPanel = ({ caseId, isOpen, onClose, userRole }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [caseTitle, setCaseTitle] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionSearch, setMentionSearch] = useState('');
    const [mentionUsers, setMentionUsers] = useState([]);
    const [cursorPosition, setCursorPosition] = useState(0);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const primaryColor = userRole === 'Manager' ? 'blue' : 'purple';

    useEffect(() => {
        if (isOpen && caseId) {
            fetchCaseTitle();
            fetchComments();
            fetchUsers();
        }
    }, [isOpen, caseId]);

    useEffect(() => {
        scrollToBottom();
    }, [comments]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchCaseTitle = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/cases/${caseId}`, {
                headers: { 'x-auth-token': token }
            });
            setCaseTitle(response.data.caseTitle);
        } catch (err) {
            console.error('Error fetching case title:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/users`, {
                headers: { 'x-auth-token': token }
            });
            // Filter to only HOC and Manager users
            const filteredUsers = response.data.filter(user =>
                user.role === 'HOC' || user.role === 'Manager'
            );
            setMentionUsers(filteredUsers);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/cases/${caseId}/hoc-manager-comments`, {
                headers: { 'x-auth-token': token }
            });
            setComments(response.data);
        } catch (err) {
            console.error('Error fetching comments:', err);
            setMessage({ type: 'error', text: 'Failed to load comments' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextChange = (e) => {
        const value = e.target.value;
        const cursorPos = e.target.selectionStart;
        setNewComment(value);
        setCursorPosition(cursorPos);

        // Check for @ mention
        const textBeforeCursor = value.substring(0, cursorPos);
        const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

        if (lastAtSymbol !== -1) {
            const textAfterAt = textBeforeCursor.substring(lastAtSymbol + 1);
            if (!textAfterAt.includes(' ')) {
                setMentionSearch(textAfterAt.toLowerCase());
                setShowMentions(true);
            } else {
                setShowMentions(false);
            }
        } else {
            setShowMentions(false);
        }
    };

    const insertMention = (user) => {
        const textBeforeCursor = newComment.substring(0, cursorPosition);
        const textAfterCursor = newComment.substring(cursorPosition);
        const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

        const beforeMention = newComment.substring(0, lastAtSymbol);
        const mention = `@${user.name} `;
        const updatedText = beforeMention + mention + textAfterCursor;

        setNewComment(updatedText);
        setShowMentions(false);
        textareaRef.current?.focus();
    };

    const handleReply = (comment) => {
        setReplyingTo(comment);
        textareaRef.current?.focus();
    };

    const cancelReply = () => {
        setReplyingTo(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');

            // Extract mentions from comment
            const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
            const mentions = [];
            let match;
            while ((match = mentionRegex.exec(newComment)) !== null) {
                mentions.push(match[1]);
            }

            const payload = {
                content: newComment,
                replyTo: replyingTo?._id || null,
                mentions: mentions
            };

            const response = await axios.post(
                `${API_BASE_URL}/api/cases/${caseId}/hoc-manager-comments`,
                payload,
                { headers: { 'x-auth-token': token } }
            );

            setComments([...comments, response.data.comment]);
            setNewComment('');
            setReplyingTo(null);
            setMessage({ type: 'success', text: 'Comment posted successfully' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            console.error('Error posting comment:', err);
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to post comment' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredMentionUsers = mentionUsers.filter(user =>
        user.name.toLowerCase().includes(mentionSearch)
    );

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className={`${primaryColor === 'blue' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'} text-white p-4`}>
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-lg font-bold">HOC-Manager Discussion</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-sm opacity-90">{caseTitle ? `${caseTitle} - Discussions` : 'Loading...'}</p>
                </div>

                {/* Messages Area */}
                <div className="h-[calc(100%-280px)] overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-gray-500">Loading comments...</div>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <UserIcon className="w-12 h-12 mb-2 opacity-30" />
                            <p>No comments yet</p>
                            <p className="text-sm">Start the discussion!</p>
                        </div>
                    ) : (
                        <>
                            {comments.map((comment, index) => {
                                const isCurrentUserRole = comment.authorRole === userRole;
                                const bgColor = comment.authorRole === 'Manager' ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200';
                                const iconColor = comment.authorRole === 'Manager' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600';

                                return (
                                    <div
                                        key={index}
                                        className={`flex gap-3 ${isCurrentUserRole ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        <div className={`p-2 rounded-full ${iconColor} flex-shrink-0 h-fit`}>
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        <div className={`flex-1 ${isCurrentUserRole ? 'text-right' : 'text-left'}`}>
                                            <div className={`inline-block max-w-[85%] ${isCurrentUserRole ? 'pr-8' : 'pl-8'} p-3 rounded-lg border ${bgColor} relative`}>
                                                {/* Reply button - always visible */}
                                                <button
                                                    onClick={() => handleReply(comment)}
                                                    className={`absolute ${isCurrentUserRole ? 'right-2' : 'left-2'} top-2 p-1 hover:bg-white/70 rounded transition-all`}
                                                    title="Reply"
                                                >
                                                    <Reply className="w-3.5 h-3.5 text-gray-600" />
                                                </button>

                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-xs font-bold text-gray-700">
                                                        {comment.authorName}
                                                    </p>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${comment.authorRole === 'Manager' ? 'bg-blue-200 text-blue-700' : 'bg-purple-200 text-purple-700'}`}>
                                                        {comment.authorRole}
                                                    </span>
                                                </div>

                                                {/* Reply preview */}
                                                {comment.replyTo && (() => {
                                                    // Find the original message being replied to
                                                    const originalMessage = comments.find(c => c._id === comment.replyTo);
                                                    if (originalMessage) {
                                                        return (
                                                            <div className="mb-2 p-2 bg-white/50 rounded border-l-2 border-gray-400 text-xs">
                                                                <p className="text-gray-600 font-semibold mb-0.5">{originalMessage.authorName}</p>
                                                                <p className="text-gray-700 italic truncate">
                                                                    {originalMessage.content.length > 50
                                                                        ? originalMessage.content.substring(0, 50) + '...'
                                                                        : originalMessage.content}
                                                                </p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}

                                                <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                                                    {comment.content}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {formatDate(comment.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4">
                    {message.text && (
                        <p className={`text-sm mb-2 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {message.text}
                        </p>
                    )}

                    {/* Reply Preview Banner */}
                    {replyingTo && (
                        <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                                <Reply className="w-4 h-4 text-gray-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-600">Replying to {replyingTo.authorName}</p>
                                    <p className="text-xs text-gray-800 truncate">{replyingTo.content}</p>
                                </div>
                            </div>
                            <button
                                onClick={cancelReply}
                                className="p-1 hover:bg-gray-200 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Mention Dropdown */}
                    {showMentions && filteredMentionUsers.length > 0 && (
                        <div className="mb-2 max-h-40 overflow-y-auto bg-white border rounded-lg shadow-lg">
                            {filteredMentionUsers.map((user) => (
                                <button
                                    key={user._id}
                                    onClick={() => insertMention(user)}
                                    className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center gap-2 transition-colors"
                                >
                                    <AtSign className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                                    <span className="text-xs text-gray-600">({user.role})</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <textarea
                            ref={textareaRef}
                            value={newComment}
                            onChange={handleTextChange}
                            placeholder="Type @ to mention someone..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black"
                            rows="3"
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || !newComment.trim()}
                            className={`${primaryColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'} text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 h-fit`}
                        >
                            <Send className="w-4 h-4" />
                            {isSubmitting ? 'Posting...' : 'Send'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CaseCommentsPanel;
