import express from 'express';
import { getAllUsers } from '../controllers/adminController'; // Adjust path
import { protect } from '../middleware/authMiddleware'; // Adjust path
import { admin } from '../middleware/adminMiddleware'; // Adjust path

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/users', protect, admin, getAllUsers);

// Add other admin-specific routes here (e.g., delete user, update role)
// Example:
// router.delete('/users/:id', protect, admin, deleteUser);

export default router;
