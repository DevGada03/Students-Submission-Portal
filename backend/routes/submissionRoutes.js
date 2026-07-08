const express = require('express');
const { submitAssignment, getSubmissionsForAssignment, gradeSubmission } = require('../controllers/submissionController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.post('/', authMiddleware(['student']), upload.single('file'), submitAssignment);
router.get('/assignment/:assignmentId', authMiddleware(['faculty', 'admin']), getSubmissionsForAssignment);
router.put('/:submissionId/grade', authMiddleware(['faculty', 'admin']), gradeSubmission);

module.exports = router;
