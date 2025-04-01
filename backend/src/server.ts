import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pool from './config/db'; // Import pool to ensure connection is attempted at start

// Import routes
import authRoutes from './routes/authRoutes';
import licenseRoutes from './routes/licenseRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config(); // Load environment variables

const app: Express = express();
const port = process.env.PORT || 5000;
const corsOrigin = process.env.CORS_ORIGIN || '*'; // Default to allow all if not set

// Middleware
app.use(cors({
    origin: corsOrigin, // Allow requests from frontend URL
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true // If you need to handle cookies or authorization headers
}));
app.use(express.json()); // Body parser for JSON format
app.use(express.urlencoded({ extended: false })); // Body parser for URL-encoded format

// Basic Route for Testing
app.get('/api', (req: Request, res: Response) => {
  res.send('License Key API Running');
});

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/license', licenseRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler (Basic Example)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).send('Something broke!');
});

// Start Server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  console.log(`[server]: CORS enabled for origin: ${corsOrigin}`);
  // DB connection is attempted when db.ts is imported
});

// Handle graceful shutdown (optional but good practice)
process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server and DB pool');
  try {
    await pool.end();
    console.log('Database pool closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing database pool:', err);
    process.exit(1);
  }
});
