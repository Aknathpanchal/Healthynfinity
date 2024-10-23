import connectDb from '../db';
import Log from '../models/Log';
import authenticateJWT from '../middleware/authenticateJWT';
import mongoose from 'mongoose';
import { Parser } from 'json2csv';  
import { logAction } from '../../utils/logAction'; 

connectDb();

export async function GET(req) {
    const { actionType, startDate, endDate, page = 1, limit = 10, includeDeleted = false, format } = Object.fromEntries(new URL(req.url).searchParams);
    const user = authenticateJWT(req);
    
    if (user.error) {
        return new Response(JSON.stringify({ error: user.error }), { status: 401 });
    }

    const query = { deleted: includeDeleted ? { $in: [true, false] } : false };

    if (actionType) {
        query.actionType = actionType;
    }

    // Date range filter
    if (startDate && endDate) {
        query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Role-based access: Admins can see all logs, non-admin users can only see their own logs
    if (user.role !== 'admin') {
        query.userId = new mongoose.Types.ObjectId(user.userId);  // Filter by the user's ID for non-admin users
    }

    const logs = await Log.find(query)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .exec();

    // Log the action of fetching logs
    await logAction(user.userId, 'fetch_logs', user.role, {
        actionType,
        startDate,
        endDate,
        page,
        limit,
        includeDeleted,
    });

    // Check for export format
    if (format === 'csv') {
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(logs);

        return new Response(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename=logs.csv',
            },
        });
    } else { // Default to JSON format
        return new Response(JSON.stringify(logs), { status: 200 });
    }
}


export async function POST(req) {
    const { actionType, additionalData } = await req.json();
    const user = authenticateJWT(req);
    if (user.error) {
        return new Response(JSON.stringify({ error: user.error }), { status: 401 });
    }

    // Create and save the log
    const log = new Log({ actionType, userId: user.userId, role: user.role, additionalData, timestamp: new Date() });
    await log.save();

    // Log the action
    await logAction(user.userId, actionType, user.role, additionalData);

    return new Response(JSON.stringify(log), { status: 201 });
}

export async function DELETE(req) {
    const { id } = await req.json();
    const user = authenticateJWT(req);
    if (user.error) {
        return new Response(JSON.stringify({ error: user.error }), { status: 401 });
    }

    const log = await Log.findById(id);
    if (!log) {
        return new Response(JSON.stringify({ error: 'Log not found.' }), { status: 404 });
    }

    // Only admin can soft delete logs
    if (user.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

    // Mark as deleted
    await Log.findByIdAndUpdate(id, { deleted: true });

    // Log the delete action
    await logAction(user.userId, 'delete_log', user.role, { logId: id });

    return new Response(null, { status: 204 });
}
