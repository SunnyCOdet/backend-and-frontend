import express from 'express';
import {
    getMyLicense,
    bindHwid,
    validateHwid,
    generateLicenseForUser,
    revokeLicenseById
} from '../controllers/licenseController'; // Adjust path
import { protect } from '../middleware/authMiddleware'; // Adjust path
import { admin } from '../middleware/adminMiddleware'; // Adjust path

const router = express.Router();

// --- User Routes ---

// @route   GET /api/license/me
// @desc    Get the current logged-in user's license details
// @access  Private (User)
router.get('/me', protect, getMyLicense);

// @route   POST /api/license/bind
// @desc    Bind a HWID to the current logged-in user's license
// @access  Private (User)
router.post('/bind', protect, bindHwid);

// --- Public/Client Validation Route ---

// @route   POST /api/license/validate
// @desc    Validate a HWID (intended for C# client)
// @access  Public (or could be protected differently if needed)
router.post('/validate', validateHwid);


// --- Admin Routes ---

// @route   POST /api/license/generate
// @desc    Admin generates a license for a specific user
// @access  Private (Admin)
router.post('/generate', protect, admin, generateLicenseForUser);

// @route   DELETE /api/license/revoke/:id
// @desc    Admin revokes (deletes) a license by its ID
// @access  Private (Admin)
router.delete('/revoke/:id', protect, admin, revokeLicenseById);


export default router;
