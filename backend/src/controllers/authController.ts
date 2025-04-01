import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createUser, findUserByUsername, User } from '../models/User'; // Adjust path

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined.");
}

// Generate JWT Token
const generateToken = (id: number): string => {
  return jwt.sign({ id }, JWT_SECRET!, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const registerUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

   if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
   }

  try {
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (default role is 'user')
    const newUser: User = { username, password: hashedPassword, role: 'user' };
    const userId = await createUser(newUser);

    // Respond with success (don't send token on register, force login)
    res.status(201).json({ message: 'User registered successfully', userId });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  try {
    const user = await findUserByUsername(username);

    if (!user || !user.password) {
      // User not found or password field missing (shouldn't happen with DB constraints)
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // User matched, generate token
    const token = generateToken(user.id!); // user.id should exist if found

    // Respond with token and user info (excluding password)
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};
