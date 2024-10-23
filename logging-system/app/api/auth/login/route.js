import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDb from '../../db';
import User from '../../models/User';
import { logAction } from '../../../utils/logAction'; // Import the logAction utility

connectDb();

export async function POST(req) {
    try {
        const { username, password } = await req.json();

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            console.error('User not found:', username);
            return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 400 });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.error('Password mismatch for user:', username);
            return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 400 });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        // Log the login action
        await logAction(user._id, 'login', user.role);

        return new Response(JSON.stringify({ token }), { status: 200 });
    } catch (error) {
        console.error('Error during login:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}
