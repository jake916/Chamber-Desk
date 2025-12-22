const mongoose = require('mongoose');

const clientComplaintSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    case: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        required: false
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
        default: 'Pending'
    },
    replies: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        authorType: {
            type: String,
            enum: ['client', 'staff'],
            required: true
        },
        authorName: {
            type: String,
            required: true
        },
        authorRole: {
            type: String
        },
        content: {
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

module.exports = mongoose.model('ClientComplaint', clientComplaintSchema);
