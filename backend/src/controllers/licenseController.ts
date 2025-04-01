import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid'; // For generating license keys
import {
    createLicense,
    findLicenseByUserId,
    bindHwidToLicense,
    validateLicenseAndHwid,
    deleteLicenseById,
    deleteLicenseByUserId,
    findLicenseByKey,
    License
} from '../models/License'; // Adjust path
import { findUserById } from '../models/User'; // Adjust path

// Generate a unique license key
const generateLicenseKey = (): string => {
  // Example format: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
  const segments = Array(5).fill(0).map(() => uuidv4().split('-')[0].toUpperCase());
  return segments.join('-');
};

// Controller to get the current user's license
export const getMyLicense = async (req: Request, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const license = await findLicenseByUserId(req.user.id);
    if (!license) {
      // It's okay if a user doesn't have a license yet
      return res.status(404).json({ message: 'No license found for this user' });
    }
    res.json(license);
  } catch (error) {
    console.error('Error fetching license:', error);
    res.status(500).json({ message: 'Server error fetching license' });
  }
};

// Controller to bind HWID to the current user's license
export const bindHwid = async (req: Request, res: Response) => {
  const { hwid } = req.body;

  if (!req.user?.id) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  if (!hwid || typeof hwid !== 'string' || hwid.trim() === '') {
    return res.status(400).json({ message: 'Valid HWID is required' });
  }

  try {
    const license = await findLicenseByUserId(req.user.id);
    if (!license) {
      return res.status(404).json({ message: 'No license found for this user to bind HWID to' });
    }
    if (license.hwid) {
        return res.status(400).json({ message: 'HWID already bound to this license' });
    }

    const success = await bindHwidToLicense(req.user.id, hwid.trim());

    if (success) {
      res.json({ message: 'HWID bound successfully' });
    } else {
      // This might happen if the license was bound between checks (race condition) or DB error
      res.status(500).json({ message: 'Failed to bind HWID' });
    }
  } catch (error) {
    console.error('Error binding HWID:', error);
    res.status(500).json({ message: 'Server error binding HWID' });
  }
};

// Controller for C# client to validate its HWID
export const validateHwid = async (req: Request, res: Response) => {
    const { hwid } = req.body;

    if (!hwid || typeof hwid !== 'string' || hwid.trim() === '') {
        return res.status(400).json({ message: 'Valid HWID is required for validation' });
    }

    try {
        const license = await validateLicenseAndHwid(hwid.trim());

        if (license) {
            // Found a valid license bound to this HWID
            res.json({ isValid: true, licenseKey: license.license_key, userId: license.user_id });
        } else {
            // No license found for this HWID
            res.json({ isValid: false });
        }
    } catch (error) {
        console.error('Error validating HWID:', error);
        res.status(500).json({ message: 'Server error validating HWID' });
    }
};


// --- Admin Only Controllers ---

// Controller for Admin to generate a license for a specific user
export const generateLicenseForUser = async (req: Request, res: Response) => {
  const { userId } = req.body; // Get userId from request body

  if (!userId || typeof userId !== 'number') {
    return res.status(400).json({ message: 'Valid User ID is required' });
  }

  try {
    // 1. Check if user exists
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Check if user already has a license
    const existingLicense = await findLicenseByUserId(userId);
    if (existingLicense) {
      return res.status(400).json({ message: 'User already has a license' });
    }

    // 3. Generate unique key and create license
    const newLicenseKey = generateLicenseKey();
    const licenseData: License = { user_id: userId, license_key: newLicenseKey };
    const licenseId = await createLicense(licenseData);

    res.status(201).json({ message: 'License generated successfully', licenseId, licenseKey: newLicenseKey });

  } catch (error) {
    console.error('Error generating license:', error);
    res.status(500).json({ message: 'Server error generating license' });
  }
};

// Controller for Admin to revoke (delete) a license by its ID
export const revokeLicenseById = async (req: Request, res: Response) => {
    const licenseId = parseInt(req.params.id, 10); // Get license ID from URL parameter

    if (isNaN(licenseId)) {
        return res.status(400).json({ message: 'Invalid License ID format' });
    }

    try {
        const success = await deleteLicenseById(licenseId);

        if (success) {
            res.json({ message: 'License revoked successfully' });
        } else {
            // License might not have existed
            res.status(404).json({ message: 'License not found or already revoked' });
        }
    } catch (error) {
        console.error(`Error revoking license ID ${licenseId}:`, error);
        // Check for foreign key constraint errors if needed, though ON DELETE CASCADE should handle user deletion
        res.status(500).json({ message: 'Server error revoking license' });
    }
};
