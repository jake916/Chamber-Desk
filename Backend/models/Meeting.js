const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['Physical', 'Online'],
        default: 'Physical'
    },
    location: {
        type: String // For Physical meetings
    },
    meetingLink: {
        type: String // For Online meetings
    },
    platform: {
        type: String, // e.g., 'Zoho', 'Google Meet', 'Zoom', 'Other'
        default: 'Other'
    },
    attendees: [{
        email: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined'],
            default: 'pending'
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clientCreator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['scheduled', 'cancelled'],
        default: 'scheduled'
    }
});

module.exports = mongoose.model('Meeting', MeetingSchema);
