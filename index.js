import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import assignmentRoutes from './routes/assignmentRoutes.js'

dotenv.config();
connectDB();

const app = express();
app.use(express.json({ limit: '500mb' }));          // body-parser for JSON
app.use(express.urlencoded({ limit: '500mb', extended: true })); // for form-data

app.use(cors());



// Routes
app.use('/api/assignment', assignmentRoutes);



const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
