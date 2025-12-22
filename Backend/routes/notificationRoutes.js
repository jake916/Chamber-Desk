const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// @route   GET /api/notifications
// @desc    Get all notifications for the current user (optional date filter)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { date } = req.query;
        let query = { recipient: req.user.id };

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: startDate, $lte: endDate };
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications

        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/notifications/unread-count
// @desc    Get count of unread notifications
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user.id,
            read: false
        });
        res.json({ count });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/notifications/unread-dates
// @desc    Get list of dates with unread notifications
// @access  Private
router.get('/unread-dates', auth, async (req, res) => {
    try {
        const unreadNotifications = await Notification.find({
            recipient: req.user.id,
            read: false
        }).select('createdAt').sort({ createdAt: -1 });

        // Extract unique dates (YYYY-MM-DD format)
        const dates = [...new Set(
            unreadNotifications.map(notif => {
                const date = new Date(notif.createdAt);
                return date.toISOString().split('T')[0];
            })
        )];

        res.json({ dates });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }

        // Check user
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        notification.read = true;
        await notification.save();

        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, read: false },
            { $set: { read: true } }
        );

        res.json({ msg: 'All notifications marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
