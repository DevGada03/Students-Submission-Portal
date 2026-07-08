const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileData: { type: String, required: true }, // Base64 representation of the submission file
    fileName: { type: String, required: true },
    status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' },
    grade: { type: String },
    feedback: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
