const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Complaint', 'Feature Request'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    attachments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: [
            'Awaiting Reply',
            'Fixing',
            'Fixed',
            'Sent',
            'Seen',
            'Implementing',
            'Added',
            'Not Added'
        ],
        required: true
    },
    replies: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
