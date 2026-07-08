const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

const submitAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.body;
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!fileUrl) {
            return res.status(400).json({ message: 'File is required for submission' });
        }

        // Check if deadline passed
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
        
        if (new Date() > new Date(assignment.deadline)) {
            return res.status(400).json({ message: 'Deadline has passed. Submission not allowed.' });
        }

        // Check if submission already exists for this student & assignment
        let existingSubmission = await Submission.findOne({ assignment: assignmentId, student: req.user.id });
        if (existingSubmission) {
            existingSubmission.fileUrl = fileUrl;
            existingSubmission.status = 'submitted'; // Reset status to submitted if it was graded
            await existingSubmission.save();
            return res.status(200).json({ message: 'Submission updated successfully', submission: existingSubmission });
        }

        const newSubmission = new Submission({
            assignment: assignmentId,
            student: req.user.id,
            fileUrl
        });

        await newSubmission.save();
        res.status(201).json({ message: 'Assignment submitted successfully', submission: newSubmission });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getSubmissionsForAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const submissions = await Submission.find({ assignment: assignmentId }).populate('student', 'name email');
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const gradeSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { grade, feedback } = req.body;

        const submission = await Submission.findByIdAndUpdate(submissionId, {
            grade,
            feedback,
            status: 'graded'
        }, { new: true });

        res.status(200).json({ message: 'Submission graded', submission });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { submitAssignment, getSubmissionsForAssignment, gradeSubmission };
