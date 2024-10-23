// // app/api/auth/login/route.js
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import connectDb from '../db';
// import User from '../models/User';
// import { logAction } from '../../utils/logAction'; // Import the logAction utility

// connectDb();

// export async function POST(req) {
//     const { username, password } = await req.json();

//     // Check if user exists
//     const user = await User.findOne({ username });
//     if (!user) {
//         return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 400 });
//     }

//     // Check if the password matches
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//         return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 400 });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
//         expiresIn: '1h',
//     });

    // Log the login action
    await logAction(user._id, 'login', user.role);

    return new Response(JSON.stringify({ token }), { status: 200 });
}
