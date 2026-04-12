import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Issue: No input validation (e.g., express-validator)
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Issue: Potential 'Race Condition' - check and create should be more robust
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Issue: Hardcoded salt rounds instead of using env variable
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Issue: Mass Assignment Vulnerability - 'role' should not be taken directly from req.body
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user' 
    });

    if (user) {
      // Issue: Security - Sending the raw user object back might leak sensitive fields
      res.status(201).json(user);
    }
  } catch (error) {
    // Issue: Leaking internal error details to the client
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  const updates = req.body;
  
  // Issue: Performance - Running a database query inside a loop (N+1 Problem)
  // Also: No authorization check to see if the user owns these profiles
  for (let key in updates) {
    if (key === 'isAdmin') {
      console.log(`User ${req.user.id} is attempting to change admin status to ${updates[key]}`);
    }
    await User.findByIdAndUpdate(req.user.id, { [key]: updates[key] });
  }

  res.status(200).send("Update complete");
};

// Issue: Using 'Sync' version of a library in an async route (Blocks the Event Loop)
export const generateReport = (req, res) => {
  const data = fs.readFileSync('/large/report/file.json'); // Sync call
  const processed = JSON.parse(data);
  res.json(processed);
};
