const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Broadcast = require('./models/Broadcast');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for Cleanup'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const cleanupBroadcasts = async () => {
    try {
        // Get all broadcasts
        const broadcasts = await Broadcast.find();
        console.log(`Found ${broadcasts.length} broadcast(s) in the database`);

        if (broadcasts.length === 0) {
            console.log('No broadcasts to delete');
            process.exit();
        }

        // Display all broadcasts
        console.log('\nCurrent broadcasts:');
        broadcasts.forEach((broadcast, index) => {
            console.log(`${index + 1}. "${broadcast.title}" - Created: ${broadcast.createdAt}`);
        });

        // Delete all broadcasts
        const result = await Broadcast.deleteMany({});
        console.log(`\n✓ Successfully deleted ${result.deletedCount} broadcast(s)`);

        process.exit();
    } catch (error) {
        console.error('Error cleaning up broadcasts:', error);
        process.exit(1);
    }
};

cleanupBroadcasts();
