const express = require('express');
const { createAssignment, getAssignments, deleteAssignment } = require('../controllers/assignmentController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware(['faculty', 'admin']), createAssignment);
router.get('/', authMiddleware(['student', 'faculty', 'admin']), getAssignments);
router.delete('/:id', authMiddleware(['faculty', 'admin']), deleteAssignment);

module.exports = router;
