const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Meeting = require('./models/Meeting');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for Meeting Cleanup'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const cleanupPastMeetings = async () => {
    try {
        // Get current date at start of day (midnight)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        console.log(`Current date: ${today.toDateString()}\n`);

        // Find all meetings
        const allMeetings = await Meeting.find().sort({ date: 1 });
        console.log(`Total meetings in database: ${allMeetings.length}`);

        // Separate past and future meetings
        const pastMeetings = allMeetings.filter(meeting => new Date(meeting.date) < today);
        const futureMeetings = allMeetings.filter(meeting => new Date(meeting.date) >= today);

        console.log(`\nPast meetings (to be deleted): ${pastMeetings.length}`);
        console.log(`Present/Future meetings (to be kept): ${futureMeetings.length}\n`);

        if (pastMeetings.length === 0) {
            console.log('No past meetings to delete');
            process.exit();
        }

        // Display past meetings that will be deleted
        console.log('Past meetings to be deleted:');
        pastMeetings.forEach((meeting, index) => {
            console.log(`${index + 1}. "${meeting.title}" - Date: ${new Date(meeting.date).toDateString()}`);
        });

        // Delete past meetings
        const result = await Meeting.deleteMany({ date: { $lt: today } });
        console.log(`\n✓ Successfully deleted ${result.deletedCount} past meeting(s)`);

        // Show remaining meetings
        const remainingMeetings = await Meeting.find().sort({ date: 1 });
        console.log(`\nRemaining meetings: ${remainingMeetings.length}`);
        if (remainingMeetings.length > 0) {
            console.log('\nFuture/Present meetings:');
            remainingMeetings.forEach((meeting, index) => {
                console.log(`${index + 1}. "${meeting.title}" - Date: ${new Date(meeting.date).toDateString()}`);
            });
        }

        process.exit();
    } catch (error) {
        console.error('Error cleaning up past meetings:', error);
        process.exit(1);
    }
};

cleanupPastMeetings();
