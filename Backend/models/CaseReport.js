const mongoose = require('mongoose');

const CaseReportSchema = new mongoose.Schema({
    case: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Manual', 'Automated', 'System'],
        default: 'Manual'
    },
    actionType: {
        type: String,
        // e.g., 'Creation', 'StatusChange', 'Assignment', 'Update'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CaseReport', CaseReportSchema);
