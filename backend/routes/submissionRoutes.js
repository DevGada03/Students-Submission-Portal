const express = require('express');
const { submitAssignment, getSubmissionsForAssignment, gradeSubmission } = require('../controllers/submissionController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware(['student']), submitAssignment);
router.get('/assignment/:assignmentId', authMiddleware(['faculty', 'admin']), getSubmissionsForAssignment);
router.put('/:submissionId/grade', authMiddleware(['faculty', 'admin']), gradeSubmission);

module.exports = router;
