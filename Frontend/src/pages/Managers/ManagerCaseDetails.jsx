import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, User, Briefcase, AlertCircle, CheckCircle,
    FolderOpen, Plus, Download, Image as ImageIcon, File, Video, Music, FileText, Scale,
    MessageCircle, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../../components/AdminOfficer/LoadingSpinner';
import CaseReports from '../../components/AdminOfficer/CaseReports';
import DocumentSelectorDrawer from '../../components/DocumentSelectorDrawer';
import OpposingCounselSection from '../../components/AdminOfficer/OpposingCounselSection';
import FloatingChatButton from '../../components/Shared/FloatingChatButton';
import CaseCommentsPanel from '../../components/Shared/CaseCommentsPanel';
import API_BASE_URL from '../../config/api';

const ManagerCaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [caseData, setCaseData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showDocumentDrawer, setShowDocumentDrawer] = useState(false);
    const [showCommentsPanel, setShowCommentsPanel] = useState(false);
    const [unreadCommentsCount, setUnreadCommentsCount] = useState(0);
    const [caseDocuments, setCaseDocuments] = useState([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);

    useEffect(() => {
        fetchCaseDetails();
        fetchCaseDocuments();
    }, [id]);

    const fetchCaseDetails = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/cases/${id}`, {
                headers: { 'x-auth-token': token }
            });

            if (response.ok) {
                const data = await response.json();
                setCaseData(data);
            } else {
                console.error('Failed to fetch case details');
            }
        } catch (err) {
            console.error('Error fetching case details:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCaseDocuments = async () => {
        setLoadingDocuments(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/documents/case/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setCaseDocuments(res.data);
        } catch (err) {
            console.error('Error fetching case documents:', err);
        }
        setLoadingDocuments(false);
    };

    const handleAddDocumentsToCase = async (selectedDocs) => {
        try {
            const token = localStorage.getItem('token');
            for (const doc of selectedDocs) {
                await axios.put(`${API_BASE_URL}/api/documents/${doc._id}/link-to-case`,
                    { caseId: id },
                    { headers: { 'x-auth-token': token } }
                );
            }
            setMessage({ type: 'success', text: `${selectedDocs.length} document(s) added to case library` });
            fetchCaseDocuments();
        } catch (err) {
            console.error('Error adding documents to case:', err);
            setMessage({ type: 'error', text: 'Failed to add documents to case' });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'Open': 'bg-green-100 text-green-800',
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Closed': 'bg-gray-100 text-gray-800',
            'Completed-Won': 'bg-emerald-100 text-emerald-800',
            'Completed-Lost': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getFileIcon = (type) => {
        if (!type) return <File className="w-6 h-6 text-gray-500" />;
        const t = type.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(t)) return <ImageIcon className="w-6 h-6 text-blue-500" />;
        if (['pdf'].includes(t)) return <FileText className="w-6 h-6 text-red-500" />;
        if (['doc', 'docx'].includes(t)) return <FileText className="w-6 h-6 text-blue-500" />;
        if (['ppt', 'pptx'].includes(t)) return <FileText className="w-6 h-6 text-orange-500" />;
        if (['xls', 'xlsx'].includes(t)) return <FileText className="w-6 h-6 text-green-500" />;
        if (['mp4', 'mov', 'avi'].includes(t)) return <Video className="w-6 h-6 text-pink-500" />;
        if (['mp3', 'wav'].includes(t)) return <Music className="w-6 h-6 text-yellow-500" />;
        return <File className="w-6 h-6 text-gray-500" />;
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (isLoading) {
        return <LoadingSpinner message="Loading case details..." />;
    }

    if (!caseData) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Case not found</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{caseData.caseTitle}</h2>
                        <p className="text-sm text-gray-600 mt-1">Case File Details</p>
                    </div>
                </div>
            </div>

            {/* Message Alert */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm">{message.text}</p>
                </div>
            )}

            {/* Case Overview and Client Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Case Overview */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex flex-col items-center text-center lg:border-r lg:border-gray-200 lg:pr-6">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-3 shadow-xl border-4 border-blue-100">
                                <Briefcase className="w-16 h-16 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{caseData.caseTitle}</h3>
                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(caseData.status)}`}>
                                {caseData.status}
                            </span>
                        </div>

                        <div className="flex-1">
                            <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-500" />
                                Case Overview
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Case Type</p>
                                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                        {caseData.caseType}
                                    </span>
                                </div>
                                {caseData.subCategory && (
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Sub-category</p>
                                        <p className="text-sm font-medium text-gray-900">{caseData.subCategory}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Date Issue Started</p>
                                    <p className="text-sm font-medium text-gray-900">{formatDate(caseData.dateIssueStarted)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Assigned Lawyers</p>
                                    {caseData.assignedLawyers && caseData.assignedLawyers.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {caseData.assignedLawyers.map((lawyer, idx) => (
                                                <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                    {lawyer.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">Not Assigned</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Assigned Paralegals</p>
                                    {caseData.assignedParalegals && caseData.assignedParalegals.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {caseData.assignedParalegals.map((paralegal, idx) => (
                                                <span key={idx} className="px-2 py-1 text-xs bg-cyan-100 text-cyan-800 rounded-full">
                                                    {paralegal.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No paralegals assigned</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client Information */}
                {caseData.client && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex flex-col items-center text-center lg:border-r lg:border-gray-200 lg:pr-6">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-3 shadow-xl border-4 border-purple-100">
                                    <span className="text-4xl font-bold text-white">
                                        {caseData.client.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{caseData.client.name}</h3>
                                <p className="text-green-600 text-xs font-medium">Active Client</p>
                            </div>

                            <div className="flex-1">
                                <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4 text-purple-500" />
                                    Client Details
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Email Address</p>
                                        <p className="text-sm font-medium text-gray-900">{caseData.client.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Phone Number</p>
                                        <p className="text-sm font-medium text-gray-900">{caseData.client.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Address</p>
                                        <p className="text-sm font-medium text-gray-900">{caseData.client.address || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Occupation</p>
                                        <p className="text-sm font-medium text-gray-900">{caseData.client.occupation || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Case Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Details</h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Date Issue Started</p>
                        <p className="text-sm text-gray-900">{formatDate(caseData.dateIssueStarted)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Summary of Issue</p>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{caseData.summary || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Expected Outcome / Client Objective</p>
                        <p className="text-sm text-gray-900">{caseData.clientObjective || 'N/A'}</p>
                    </div>
                    <OpposingCounselSection
                        opposingCounselHistory={caseData.opposingCounselHistory}
                        onUpdateClick={null}
                        formatDate={formatDate}
                        readOnly={true}
                    />
                </div>
            </div>

            {/* Parties and Witnesses */}
            {(caseData.parties?.length > 0 || caseData.witnesses?.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {caseData.parties && caseData.parties.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Parties Involved</h3>
                            <div className="space-y-3">
                                {caseData.parties.map((party, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Name</p>
                                                <p className="text-sm font-medium text-gray-900">{party.name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Role</p>
                                                <p className="text-sm font-medium text-gray-900">{party.role || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Address</p>
                                                <p className="text-sm font-medium text-gray-900">{party.address || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Contact</p>
                                                <p className="text-sm font-medium text-gray-900">{party.contact || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {caseData.witnesses && caseData.witnesses.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Witnesses</h3>
                            <div className="space-y-3">
                                {caseData.witnesses.map((witness, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Name</p>
                                                <p className="text-sm font-medium text-gray-900">{witness.name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Contact</p>
                                                <p className="text-sm font-medium text-gray-900">{witness.contact || 'N/A'}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <p className="text-xs text-gray-600">Statement</p>
                                                <p className="text-sm font-medium text-gray-900">{witness.statement || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Court Information */}
            {caseData.inCourt && caseData.courtInfo && caseData.courtInfo.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Current Court Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <Scale className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Current Court Status</h3>
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded font-medium">
                                    {caseData.courtInfo.length === 1 ? '1st Court Date' :
                                        caseData.courtInfo.length === 2 ? '2nd Court Date' :
                                            caseData.courtInfo.length === 3 ? '3rd Court Date' :
                                                `${caseData.courtInfo.length}th Court Date`} (Current)
                                </span>
                            </div>
                        </div>
                        {(() => {
                            const currentInfo = caseData.courtInfo[caseData.courtInfo.length - 1];
                            return (
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Court Name</p>
                                        <p className="text-sm font-medium text-gray-900">{currentInfo.courtName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Court Location</p>
                                        <p className="text-sm font-medium text-gray-900">{currentInfo.courtLocation || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Case Number</p>
                                        <p className="text-sm font-medium text-gray-900">{currentInfo.caseNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Presiding Judge</p>
                                        <p className="text-sm font-medium text-gray-900">{currentInfo.presidingJudge || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Next Court Date</p>
                                        <p className="text-sm font-medium text-gray-900">{formatDate(currentInfo.nextCourtDate)}</p>
                                    </div>
                                    {currentInfo.previousOrders && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Court Orders / Notes</p>
                                            <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">{currentInfo.previousOrders}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Court History */}
                    {caseData.courtInfo.length > 1 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Court History</h3>
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                {[...caseData.courtInfo].reverse().slice(1).map((info, index) => {
                                    const originalIndex = caseData.courtInfo.length - index - 2;
                                    const count = originalIndex + 1;
                                    const label = count === 1 ? '1st' : count === 2 ? '2nd' : count === 3 ? '3rd' : `${count}th`;

                                    return (
                                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label} Court Date</span>
                                                <span className="text-xs text-gray-400">{formatDate(info.dateAdded || info.nextCourtDate)}</span>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div><span className="text-gray-500">Court:</span> <span className="text-gray-900">{info.courtName || '-'}</span></div>
                                                <div><span className="text-gray-500">Judge:</span> <span className="text-gray-900">{info.presidingJudge || '-'}</span></div>
                                                <div><span className="text-gray-500">Date:</span> <span className="text-gray-900">{formatDate(info.nextCourtDate)}</span></div>
                                                {info.previousOrders && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                        <p className="text-gray-500 text-xs mb-1">Orders/Notes:</p>
                                                        <p className="text-gray-800">{info.previousOrders}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-center">
                            <div className="text-center">
                                <Scale className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No previous court dates</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Scale className="w-5 h-5 text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900">Court Information</h3>
                        </div>
                    </div>
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <Scale className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">This case is not currently in court</p>
                    </div>
                </div>
            )}


            {/* Case Library */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Case Library</h3>
                        {caseDocuments.length > 0 && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                                {caseDocuments.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setShowDocumentDrawer(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Documents
                    </button>
                </div>

                {loadingDocuments ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Loading documents...</p>
                    </div>
                ) : caseDocuments.length === 0 ? (
                    <div className="text-center py-8">
                        <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No documents in case library</p>
                        <p className="text-sm text-gray-400 mt-1">Click "Add Documents" to upload files</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {caseDocuments.map((doc) => (
                            <div key={doc._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                    {getFileIcon(doc.type)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{formatSize(doc.size)}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatDate(doc.createdAt)}
                                        </p>
                                    </div>
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>



            {/* Case Reports & Updates */}
            <CaseReports caseId={id} />

            {/* Client Reports & Discussions */}
            {caseData.clientReports && caseData.clientReports.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Client Reports & Discussions</h3>
                    </div>
                    <div className="space-y-3">
                        {[...caseData.clientReports].reverse().map((report) => (
                            <div
                                key={report._id}
                                onClick={() => navigate(`/manager/cases/${id}/report/${report._id}`)}
                                className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                                            {report.subject}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Posted {formatDate(report.createdAt)}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                                </div>

                                <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                                    {report.content.length > 100 ? report.content.substring(0, 100) + '...' : report.content}
                                </p>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
                                        <MessageCircle className="w-3 h-3" />
                                        <span>{report.replies?.length || 0} {report.replies?.length === 1 ? 'reply' : 'replies'}</span>
                                    </div>
                                    {report.replies && report.replies.some(r => r.authorType === 'client') && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                            Client replied
                                        </span>
                                    )}
                                    <span className="text-xs text-green-600 font-medium group-hover:underline ml-auto">
                                        View Thread →
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Document Selector Drawer */}
            {showDocumentDrawer && (
                <DocumentSelectorDrawer
                    isOpen={showDocumentDrawer}
                    onClose={() => setShowDocumentDrawer(false)}
                    onSelectDocuments={handleAddDocumentsToCase}
                    excludeDocuments={caseDocuments.map(d => d._id)}
                />
            )}
                        {/* Floating Chat Button */}
            <FloatingChatButton
                onClick={() => setShowCommentsPanel(true)}
                unreadCount={unreadCommentsCount}
                primaryColor="blue"
            />

            {/* Comments Panel */}
            <CaseCommentsPanel
                caseId={id}
                isOpen={showCommentsPanel}
                onClose={() => setShowCommentsPanel(false)}
                userRole="Manager"
            />
        </div>
    );
};

export default ManagerCaseDetails;
