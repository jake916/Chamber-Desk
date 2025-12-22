const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    size: {
        type: Number, // Size in bytes
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    case: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case'
    },
    folder: {
        type: String,
        default: 'root'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Document', DocumentSchema);
