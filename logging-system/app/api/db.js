// app/api/db.js
import mongoose from 'mongoose';

const connectDb = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

export default connectDb;
