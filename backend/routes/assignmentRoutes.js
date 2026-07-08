const express = require('express');
const { createAssignment, getAssignments, deleteAssignment } = require('../controllers/assignmentController');
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

router.post('/', authMiddleware(['faculty', 'admin']), upload.single('file'), createAssignment);
router.get('/', authMiddleware(['student', 'faculty', 'admin']), getAssignments);
router.delete('/:id', authMiddleware(['faculty', 'admin']), deleteAssignment);

module.exports = router;
