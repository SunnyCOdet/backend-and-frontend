import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface User {
  id?: number;
  username: string;
  password?: string; // Included for creation, excluded for retrieval typically
  role: 'user' | 'admin';
  created_at?: Date;
  license?: any; // Optional: To join license data later
}

export const createUser = async (user: User): Promise<number> => {
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    [user.username, user.password, user.role || 'user']
  );
  return result.insertId;
};

export const findUserByUsername = async (username: string): Promise<User | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );
  if (rows.length === 0) {
    return null;
  }
  // Map RowDataPacket to User interface
  const user: User = {
    id: rows[0].id,
    username: rows[0].username,
    password: rows[0].password, // Be careful returning password hash
    role: rows[0].role,
    created_at: rows[0].created_at,
  };
  return user;
};

export const findUserById = async (id: number): Promise<User | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(
      // Exclude password hash for general retrieval
      'SELECT id, username, role, created_at FROM users WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return null;
    }
     const user: User = {
        id: rows[0].id,
        username: rows[0].username,
        role: rows[0].role,
        created_at: rows[0].created_at,
    };
    return user;
};

// Admin function to get all users (potentially with licenses)
export const findAllUsersWithLicenses = async (): Promise<User[]> => {
    const query = `
        SELECT
            u.id, u.username, u.role, u.created_at,
            l.id as license_id, l.license_key, l.hwid as license_hwid
        FROM users u
        LEFT JOIN licenses l ON u.id = l.user_id
        ORDER BY u.id;
    `;
    const [rows] = await pool.query<RowDataPacket[]>(query);

    // Process rows to structure data correctly
    return rows.map(row => ({
        id: row.id,
        username: row.username,
        role: row.role,
        created_at: row.created_at,
        license: row.license_id ? { // Only include license object if it exists
            id: row.license_id,
            license_key: row.license_key,
            hwid: row.license_hwid
        } : null
    }));
};
