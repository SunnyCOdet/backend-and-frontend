import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface License {
  id?: number;
  user_id: number;
  license_key: string;
  hwid?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export const createLicense = async (license: License): Promise<number> => {
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO licenses (user_id, license_key) VALUES (?, ?)',
    [license.user_id, license.license_key]
  );
  return result.insertId;
};

export const findLicenseByUserId = async (userId: number): Promise<License | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM licenses WHERE user_id = ?',
    [userId]
  );
  if (rows.length === 0) {
    return null;
  }
   const license: License = {
        id: rows[0].id,
        user_id: rows[0].user_id,
        license_key: rows[0].license_key,
        hwid: rows[0].hwid,
        created_at: rows[0].created_at,
        updated_at: rows[0].updated_at,
    };
  return license;
};

export const findLicenseByKey = async (key: string): Promise<License | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM licenses WHERE license_key = ?',
      [key]
    );
    if (rows.length === 0) {
      return null;
    }
     const license: License = {
          id: rows[0].id,
          user_id: rows[0].user_id,
          license_key: rows[0].license_key,
          hwid: rows[0].hwid,
          created_at: rows[0].created_at,
          updated_at: rows[0].updated_at,
      };
    return license;
};


export const bindHwidToLicense = async (userId: number, hwid: string): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE licenses SET hwid = ? WHERE user_id = ? AND hwid IS NULL', // Only allow binding if not already bound
    [hwid, userId]
  );
  return result.affectedRows > 0;
};

// Alternative: Bind by license key (might be useful for C# client)
export const bindHwidByLicenseKey = async (licenseKey: string, hwid: string): Promise<boolean> => {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE licenses SET hwid = ? WHERE license_key = ? AND hwid IS NULL',
      [hwid, licenseKey]
    );
    return result.affectedRows > 0;
};


export const validateLicenseAndHwid = async (hwid: string): Promise<License | null> => {
    // Find a license that matches the provided HWID
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM licenses WHERE hwid = ?',
      [hwid]
    );
    if (rows.length === 0) {
      return null; // No license bound to this HWID
    }
    // Return the first matching license (should ideally be unique HWID per license)
     const license: License = {
          id: rows[0].id,
          user_id: rows[0].user_id,
          license_key: rows[0].license_key,
          hwid: rows[0].hwid,
          created_at: rows[0].created_at,
          updated_at: rows[0].updated_at,
      };
    return license;
};

export const deleteLicenseById = async (licenseId: number): Promise<boolean> => {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM licenses WHERE id = ?',
      [licenseId]
    );
    return result.affectedRows > 0;
};

export const deleteLicenseByUserId = async (userId: number): Promise<boolean> => {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM licenses WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0; // Returns true if one or more rows were deleted
};
