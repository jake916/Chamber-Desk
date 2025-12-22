const mongoose = require('mongoose');
const crypto = require('crypto');

const clientSchema = new mongoose.Schema({
    clientType: {
        type: String,
        enum: ['Individual', 'Corporate Organization', 'Government Agency'],
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },

    // Individual-specific fields
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    dateOfBirth: {
        type: Date
    },
    nationality: {
        type: String,
        trim: true
    },
    occupation: {
        type: String,
        trim: true
    },
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String
    },

    // Corporate-specific fields
    rcNumber: {
        type: String,
        trim: true
    },
    contactPerson: {
        type: String,
        trim: true
    },

    // Government Agency-specific fields
    agencyType: {
        type: String,
        enum: ['Federal Government', 'State Government', 'Local Government', 'MDAs', 'Parastatal']
    },
    ministry: {
        type: String,
        trim: true
    },

    // Contact persons (for Corporate and Government Agency)
    primaryContact: {
        name: String,
        designation: String,
        phone: String,
        email: String
    },
    secondaryContact: {
        name: String,
        designation: String,
        phone: String,
        email: String
    },

    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Inactive'
    },

    // Client Portal Fields
    shareToken: {
        type: String,
        unique: true,
        sparse: true
    },
    clientAccessPin: {
        type: String // Hashed 4-digit PIN
    },
    pinSetupCompleted: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to auto-generate shareToken on creation
clientSchema.pre('save', function (next) {
    if (this.isNew && !this.shareToken) {
        this.shareToken = crypto.randomUUID();
    }
    next();
});

module.exports = mongoose.model('Client', clientSchema);
