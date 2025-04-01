import { Request, Response } from 'express';
import { findAllUsersWithLicenses } from '../models/User'; // Adjust path as needed
// Import other models if needed for more admin actions (e.g., deleting users)

// Controller to get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Fetch users, potentially joining with license data
    const users = await findAllUsersWithLicenses();
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// Add other admin-specific controllers here if needed, e.g.:
// - deleteUser
// - updateUserRole
// - etc.
