import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import marksRoutes from './routes/marksRoutes.js'; // Note the .js extension

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database Connection
mongoose.connect('mongodb://localhost:27017/afma')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('DB Error:', err));

// Routes
app.use('/api', marksRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));