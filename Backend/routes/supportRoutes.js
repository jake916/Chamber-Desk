const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SupportTicket = require('../models/SupportTicket');
const { notifySuperAdmins } = require('../utils/notificationHelper');

// @route   POST /api/support
// @desc    Create a new support ticket (Complaint or Feature Request)
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { type, title, description, attachments } = req.body;

        if (!type || !title || !description) {
            return res.status(400).json({ msg: 'Please provide all required fields' });
        }

        // Set default status based on type
        const defaultStatus = type === 'Complaint'
            ? 'Awaiting Reply'
            : 'Sent';

        const newTicket = new SupportTicket({
            type,
            title,
            description,
            attachments: attachments || [],
            user: req.user.id,
            status: defaultStatus
        });

        const savedTicket = await newTicket.save();

        // Notify Superadmins with specific notification type
        const notificationType = type === 'Complaint' ? 'support_complaint' : 'support_feature_request';
        const notificationMessage = type === 'Complaint'
            ? `New complaint submitted: ${title}`
            : `New feature request submitted: ${title}`;

        await notifySuperAdmins(
            notificationType,
            notificationMessage,
            {
                entityType: 'SupportTicket',
                entityId: savedTicket._id
            }
        );

        // Notify the submitter that their ticket was received
        const Notification = require('../models/Notification');
        await Notification.create({
            recipient: req.user.id,
            type: 'support_ticket_submitted',
            message: `Your ${type.toLowerCase()} "${title}" has been submitted successfully. Our tech support team will review it shortly.`,
            relatedEntity: {
                entityType: 'SupportTicket',
                entityId: savedTicket._id
            }
        });

        res.json(savedTicket);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/support
// @desc    Get support tickets for current user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ user: req.user.id })
            .populate('user', 'name email')
            .populate('replies.user', 'name')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/support/all
// @desc    Get all support tickets (Superadmin only)
// @access  Private (Superadmin)
router.get('/all', auth, async (req, res) => {
    try {
        // Check if user is Superadmin
        const user = await require('../models/User').findById(req.user.id);
        if (user.role !== 'Superadmin') {
            return res.status(403).json({ msg: 'Access denied. Superadmin only.' });
        }

        const tickets = await SupportTicket.find()
            .populate('user', 'name email')
            .populate('replies.user', 'name')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/support/:id
// @desc    Get single support ticket by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id)
            .populate('user', 'name email')
            .populate('replies.user', 'name')
            .populate('attachments');

        if (!ticket) {
            return res.status(404).json({ msg: 'Ticket not found' });
        }

        // Check if user owns the ticket or is a Superadmin
        const user = await require('../models/User').findById(req.user.id);
        if (ticket.user._id.toString() !== req.user.id && user.role !== 'Superadmin') {
            return res.status(403).json({ msg: 'Not authorized to view this ticket' });
        }

        res.json(ticket);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Ticket not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/support/:id/reply
// @desc    Add a reply to a support ticket (All authenticated users)
// @access  Private
router.post('/:id/reply', auth, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ msg: 'Please provide a message' });
        }

        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ msg: 'Ticket not found' });
        }

        // Check if user is authorized (ticket owner or Superadmin)
        const user = await require('../models/User').findById(req.user.id);
        if (ticket.user.toString() !== req.user.id && user.role !== 'Superadmin') {
            return res.status(403).json({ msg: 'Not authorized to reply to this ticket' });
        }

        ticket.replies.push({
            user: req.user.id,
            message
        });

        await ticket.save();

        const updatedTicket = await SupportTicket.findById(req.params.id)
            .populate('user', 'name email')
            .populate('replies.user', 'name')
            .populate('attachments');

        // Notify the appropriate party about the new reply
        const Notification = require('../models/Notification');

        // If the replier is the ticket owner, notify Superadmins
        if (ticket.user.toString() === req.user.id) {
            await notifySuperAdmins(
                'support_ticket_reply',
                `${user.name} replied to their ${ticket.type.toLowerCase()}: "${ticket.title}"`,
                {
                    entityType: 'SupportTicket',
                    entityId: ticket._id
                }
            );
        } else {
            // If the replier is Superadmin, notify the ticket owner
            await Notification.create({
                recipient: ticket.user,
                type: 'support_ticket_reply',
                message: `Tech support replied to your ${ticket.type.toLowerCase()}: "${ticket.title}"`,
                relatedEntity: {
                    entityType: 'SupportTicket',
                    entityId: ticket._id
                }
            });
        }

        res.json(updatedTicket);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Ticket not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/support/:id/status
// @desc    Update ticket status (Superadmin only)
// @access  Private (Superadmin)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ msg: 'Please provide a status' });
        }

        // Check if user is Superadmin
        const user = await require('../models/User').findById(req.user.id);
        if (user.role !== 'Superadmin') {
            return res.status(403).json({ msg: 'Only Superadmins can update ticket status' });
        }

        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ msg: 'Ticket not found' });
        }

        ticket.status = status;
        await ticket.save();

        const updatedTicket = await SupportTicket.findById(req.params.id)
            .populate('user', 'name email')
            .populate('replies.user', 'name')
            .populate('attachments');

        // Notify the ticket submitter about status change
        const Notification = require('../models/Notification');
        await Notification.create({
            recipient: ticket.user,
            type: 'support_ticket_reply',
            message: `Your ${ticket.type.toLowerCase()} "${ticket.title}" status changed to: ${status}`,
            relatedEntity: {
                entityType: 'SupportTicket',
                entityId: ticket._id
            }
        });

        // Notify all Superadmins about the status change
        await notifySuperAdmins(
            'ticket_status_changed',
            `${ticket.type} status changed to "${status}": ${ticket.title}`,
            {
                entityType: 'SupportTicket',
                entityId: ticket._id
            }
        );

        res.json(updatedTicket);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Ticket not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
