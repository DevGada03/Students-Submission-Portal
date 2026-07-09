const Assignment = require('../models/Assignment');

const createAssignment = async (req, res) => {
    try {
        const { title, description, deadline, department, fileData, fileName } = req.body;

        const newAssignment = new Assignment({
            title,
            description,
            deadline,
            department,
            fileData,
            fileName,
            createdBy: req.user.id
        });

        await newAssignment.save();
        res.status(201).json({ message: 'Assignment created successfully', assignment: newAssignment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAssignments = async (req, res) => {
    try {
        const { department, role, id } = req.user;
        let assignments;

        if (role === 'student') {
            // Students only see assignments for their department
            const rawAssignments = await Assignment.find({ department }).populate('createdBy', 'name email').lean();
            const Submission = require('../models/Submission');
            const studentSubmissions = await Submission.find({ student: id });
            
            assignments = rawAssignments.map(assign => {
                const sub = studentSubmissions.find(s => s.assignment.toString() === assign._id.toString());
                return {
                    ...assign,
                    submission: sub ? { _id: sub._id, fileData: sub.fileData, fileName: sub.fileName, status: sub.status, grade: sub.grade, feedback: sub.feedback } : null
                };
            });
        } else if (role === 'faculty') {
            // Faculty can see assignments they created
            assignments = await Assignment.find({ createdBy: id }).populate('createdBy', 'name email');
        } else {
            // Admin sees all
            assignments = await Assignment.find().populate('createdBy', 'name email');
        }

        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await Assignment.findById(id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Verify that the faculty member deleting this assignment is the creator
        if (assignment.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. You can only delete assignments created by you.' });
        }

        await Assignment.findByIdAndDelete(id);
        
        // Optionally delete any submissions associated with this assignment
        const Submission = require('../models/Submission');
        await Submission.deleteMany({ assignment: id });

        res.status(200).json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createAssignment, getAssignments, deleteAssignment };
