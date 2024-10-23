// app/api/auth/register/route.js
import bcrypt from 'bcryptjs';
import connectDb from '../../db';
import User from '../../models/User';
import { logAction } from '../../../utils/logAction'; // Import the logAction utility

connectDb();

export async function POST(req) {
    const { username, password, role } = await req.json();

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return new Response(JSON.stringify({ message: 'User already exists' }), { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({ username, password: hashedPassword, role });
    await user.save();

    // Log the registration action
    await logAction(user._id, 'register', role);

    return new Response(JSON.stringify({ message: 'User registered successfully' }), { status: 201 });
}
