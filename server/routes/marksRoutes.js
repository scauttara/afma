import express from 'express';
import { getStudentsByClass, updateBulkMarks, createStudent, deleteStudent } from '../controllers/marksController.js';

const router = express.Router();

router.get('/students/:className', getStudentsByClass);
router.post('/update-marks', updateBulkMarks);
router.post('/add-student', createStudent); // <--- NEW ROUTE
router.delete('/delete-student/:id', deleteStudent);

export default router;