const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'client_added',
            'client_status_changed',
            'fund_assigned',
            'fund_approved',
            'fund_rejected',
            'fund_overdue',
            'fund_submitted',
            'case_created',
            'case_status_changed',
            'case_assigned',
            'case_assignment', // Added for HOC notification
            'case_report_added',
            'case_updated',
            'lawyers_assigned',
            'lawyers_removed',
            'paralegals_assigned',
            'paralegals_removed',
            'document_added_to_case',
            'document_upload',
            'document_share',
            'document_unshare',
            'court_update',
            'counsel_updated',
            'support_complaint',
            'support_feature_request',
            'support_ticket_submitted',
            'support_ticket_reply',
            'user_created',
            'user_role_changed',
            'user_name_changed',
            'user_email_changed',
            'user_password_changed',
            'user_deleted',
            'ticket_status_changed',
            'task_created',
            'task_updated',
            'task_deleted',
            'task_comment_added',
            'task_reply_added',
            'task_subtask_added',
            'task_subtask_deleted',
            'task_member_added',
            'meeting_created',
            'meeting_rsvp_accepted',
            'meeting_rsvp_declined',
            'meeting_updated',
            'meeting_cancelled',
            'client_case_created',
            'client_case_updated',
            'client_court_update',
            'client_parties_added',
            'client_opposing_counsel_updated',
            'client_case_status_changed',
            'client_report_added',
            'client_meeting_created',
            'client_meeting_invitation',
            'client_meeting_rsvp_accepted',
            'client_meeting_rsvp_declined',
            'client_meeting_updated',
            'client_meeting_cancelled',
            'client_complaint_created',
            'client_complaint_status_changed',
            'client_complaint_reply',
            'hoc_manager_comment',
            'broadcast_created',
            'general'
        ],
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    relatedEntity: {
        entityType: {
            type: String,
            enum: ['Client', 'FundRequisition', 'User', 'Case', 'Document', 'SupportTicket', 'Meeting', 'Task', 'ClientComplaint', 'Broadcast']
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId
        }
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
