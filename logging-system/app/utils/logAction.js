// app/utils/logAction.js
import Log from '../api/models/Log';
import connectDb from '../api/db';

connectDb();

export async function logAction(userId, actionType, role, metadata = {}) {
    try {
        const log = new Log({
            userId,
            actionType,
            role,
            timestamp: new Date(),
            metadata,
        });
        await log.save();
        console.log('Log created successfully');
    } catch (error) {
        console.error('Error creating log:', error);
    }
}
