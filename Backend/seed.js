const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const seedSuperadmin = async () => {
    try {
        const existingSuperadmin = await User.findOne({ role: 'Superadmin' });
        if (existingSuperadmin) {
            console.log('Superadmin already exists');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const superadmin = new User({
            name: 'Super Admin',
            email: 'super@chamberdesk.com',
            password: hashedPassword,
            role: 'Superadmin'
        });

        await superadmin.save();
        console.log('Superadmin created successfully');
        console.log('Email: super@chamberdesk.com');
        console.log('Password: admin123');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedSuperadmin();
