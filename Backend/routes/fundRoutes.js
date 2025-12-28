const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FundRequisition = require('../models/FundRequisition');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { notifyAdmins } = require('../utils/notificationHelper');

// @route   POST /api/funds
// @desc    Create a fund requisition
// @access  Private (any authenticated user)
router.post('/', auth, async (req, res) => {
    const { amount, purpose, type, urgency } = req.body;

    try {
        const fundRequisition = new FundRequisition({
            requestedBy: req.user.id,
            amount,
            purpose,
            type,
            urgency
        });

        await fundRequisition.save();

        // Notify Admin Officers
        const adminOfficers = await User.find({ role: 'Admin' });

        const notifications = adminOfficers.map(admin => ({
            recipient: admin._id,
            type: 'general',
            message: `New fund requisition of ₦${amount.toLocaleString()} submitted`,
            relatedEntity: {
                entityType: 'FundRequisition',
                entityId: fundRequisition._id
            }
        }));

        await Notification.insertMany(notifications);

        // Notify the requester (HOC/User)
        const requesterNotification = new Notification({
            recipient: req.user.id,
            type: 'fund_submitted',
            message: `Your fund requisition of ₦${amount.toLocaleString()} has been submitted successfully`,
            relatedEntity: {
                entityType: 'FundRequisition',
                entityId: fundRequisition._id
            }
        });
        await requesterNotification.save();

        res.json({
            msg: 'Fund requisition created successfully',
            fundRequisition
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/funds
// @desc    Get all fund requisitions (role-based filtering)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        let query = {};

        // Filter based on role
        if (req.user.role === 'Admin' || req.user.role === 'Manager') {
            // Admin and Manager see all requisitions
        } else {
            // Others see only their own requisitions
            query.requestedBy = req.user.id;
        }

        const fundRequisitions = await FundRequisition.find(query)
            .populate('requestedBy', 'name email role')
            .populate('assignedTo', 'name email')
            .populate('assignedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(fundRequisitions);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/funds/:id/assign
// @desc    Assign fund requisition to a manager (Admin Officer only)
// @access  Private
router.put('/:id/assign', auth, async (req, res) => {
    const { managerId } = req.body;

    try {
        // Check if user is Admin Officer
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ msg: 'Access denied. Admin Officer only.' });
        }

        // Verify manager exists and has Manager role
        const manager = await User.findById(managerId);
        if (!manager || manager.role !== 'Manager') {
            return res.status(400).json({ msg: 'Invalid manager selected' });
        }

        const fundRequisition = await FundRequisition.findById(req.params.id);

        if (!fundRequisition) {
            return res.status(404).json({ msg: 'Fund requisition not found' });
        }

        fundRequisition.assignedTo = managerId;
        fundRequisition.assignedBy = req.user.id;
        fundRequisition.status = 'Assigned';

        await fundRequisition.save();

        // Notify the manager
        const notification = new Notification({
            recipient: managerId,
            type: 'fund_assigned',
            message: `Fund requisition of $${fundRequisition.amount} has been assigned to you`,
            relatedEntity: {
                entityType: 'FundRequisition',
                entityId: fundRequisition._id
            }
        });

        await notification.save();

        // Notify the requester
        const requesterNotification = new Notification({
            recipient: fundRequisition.requestedBy,
            type: 'fund_assigned',
            message: `Your fund requisition of ₦${fundRequisition.amount.toLocaleString()} has been assigned to ${manager.name}`,
            relatedEntity: {
                entityType: 'FundRequisition',
                entityId: fundRequisition._id
            }
        });
        await requesterNotification.save();

        res.json({
            msg: 'Fund requisition assigned successfully',
            fundRequisition
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/funds/:id/approve
// @desc    Approve or reject fund requisition (Manager only)
// @access  Private
router.put('/:id/approve', auth, async (req, res) => {
    const { status, comment } = req.body;

    try {
        // Check if user is Manager
        if (req.user.role !== 'Manager') {
            return res.status(403).json({ msg: 'Access denied. Manager only.' });
        }

        const fundRequisition = await FundRequisition.findById(req.params.id);

        if (!fundRequisition) {
            return res.status(404).json({ msg: 'Fund requisition not found' });
        }

        // Verify this requisition is assigned to this manager
        if (fundRequisition.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to approve this requisition' });
        }

        fundRequisition.status = status; // 'Approved' or 'Rejected'
        fundRequisition.managerComment = comment;

        await fundRequisition.save();

        // Notify the requester
        const notification = new Notification({
            recipient: fundRequisition.requestedBy,
            type: status === 'Approved' ? 'fund_approved' : 'fund_rejected',
            message: `Your fund requisition of ₦${fundRequisition.amount.toLocaleString()} has been ${status.toLowerCase()}`,
            relatedEntity: {
                entityType: 'FundRequisition',
                entityId: fundRequisition._id
            }
        });

        await notification.save();

        // Notify admins about manager's decision
        const manager = await User.findById(req.user.id);
        await notifyAdmins(
            status === 'Approved' ? 'fund_approved' : 'fund_rejected',
            `Fund requisition of ₦${fundRequisition.amount.toLocaleString()} has been ${status.toLowerCase()} by ${manager.name}`,
            {
                entityType: 'FundRequisition',
                entityId: fundRequisition._id
            }
        );

        res.json({
            msg: `Fund requisition ${status.toLowerCase()} successfully`,
            fundRequisition
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/funds/check-overdue
// @desc    Check for overdue requisitions and notify admins (Manual trigger or scheduled)
// @access  Private (Admin only)
router.get('/check-overdue', auth, async (req, res) => {
    try {
        // Check if user is Admin
        if (req.user.role !== 'Admin' && req.user.role !== 'Superadmin') {
            return res.status(403).json({ msg: 'Access denied. Admin only.' });
        }

        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        // Find pending requisitions older than 3 days
        const overdueRequisitions = await FundRequisition.find({
            status: 'Pending',
            createdAt: { $lt: threeDaysAgo }
        }).populate('requestedBy', 'name');

        let notificationCount = 0;

        for (const reqItem of overdueRequisitions) {
            // Check if we already notified about this in the last 24 hours
            const oneDayAgo = new Date();
            oneDayAgo.setHours(oneDayAgo.getHours() - 24);

            const existingNotification = await Notification.findOne({
                type: 'fund_overdue',
                'relatedEntity.entityId': reqItem._id,
                createdAt: { $gt: oneDayAgo }
            });

            if (!existingNotification) {
                await notifyAdmins(
                    'fund_overdue',
                    `Overdue Fund Requisition: ₦${reqItem.amount} requested by ${reqItem.requestedBy?.name || 'Unknown'} is pending for more than 3 days`,
                    {
                        entityType: 'FundRequisition',
                        entityId: reqItem._id
                    }
                );
                notificationCount++;
            }
        }

        res.json({
            msg: 'Overdue check completed',
            foundOverdue: overdueRequisitions.length,
            notificationsSent: notificationCount
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
