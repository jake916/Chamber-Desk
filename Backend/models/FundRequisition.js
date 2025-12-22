const mongoose = require('mongoose');

const fundRequisitionSchema = new mongoose.Schema({
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    purpose: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Assigned', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    managerComment: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
fundRequisitionSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('FundRequisition', fundRequisitionSchema);
