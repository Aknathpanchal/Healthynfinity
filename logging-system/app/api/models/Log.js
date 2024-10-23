// app/models/Log.js
import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    actionType: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    metadata: {
        type: Object,
        default: {},
    },
    deleted: {
        type: Boolean,
        default: false,
    },
});

const Log = mongoose.models.Log || mongoose.model('Log', logSchema);

export default Log;
