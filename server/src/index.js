import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { connectDB } from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

// Configure Cloudinary
configureCloudinary();

const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(helmet());
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000 // limit each IP to 1000 requests per windowMs
});
app.use('/api', limiter);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import savingsRoutes from './routes/savingsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/incomes', incomeRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/budgets', budgetRoutes);
app.use('/api/v1/savings', savingsRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reports', reportsRoutes);

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'SpendWise API is running' });
});

// Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
