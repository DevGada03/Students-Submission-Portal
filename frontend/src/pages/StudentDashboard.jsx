import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Upload, LogOut, CheckCircle, Clock } from 'lucide-react';

const StudentDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [editModes, setEditModes] = useState({});
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token || user?.role !== 'student') {
      navigate('/login');
      return;
    }
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/assignments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const submitAssignment = async (assignmentId) => {
    if (!selectedFile) return alert('Please select a file to submit.');
    
    setUploadingId(assignmentId);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('assignmentId', assignmentId);

    try {
      await axios.post('http://localhost:5000/api/submissions', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Assignment submitted successfully!');
      setSelectedFile(null);
      setEditModes({ ...editModes, [assignmentId]: false });
      fetchAssignments();
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting assignment');
    } finally {
      setUploadingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>Student Portal</h1>
          <p className="subtitle" style={{ margin: 0 }}>Welcome back, {user?.name} | {user?.department}</p>
        </div>
        <button className="btn btn-outline" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={24} color="var(--primary)" /> My Assignments
        </h2>
        
        {loading ? (
          <p>Loading assignments...</p>
        ) : assignments.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No assignments found for your department.
          </div>
        ) : (
          <div className="grid-cards">
            {assignments.map(assignment => (
              <div key={assignment._id} className="glass-panel card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{assignment.title}</h3>
                  {assignment.submission ? (
                    <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '600' }}>
                      {assignment.submission.status === 'graded' ? 'Graded' : 'Submitted'}
                    </span>
                  ) : (
                    <span style={{ 
                      background: new Date(assignment.deadline) > new Date() ? 'rgba(99, 102, 241, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                      color: new Date(assignment.deadline) > new Date() ? 'var(--primary)' : 'var(--danger)', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.8rem', 
                      fontWeight: '600' 
                    }}>
                      {new Date(assignment.deadline) > new Date() ? 'Pending' : 'Overdue'}
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>{assignment.description}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#f59e0b', marginTop: '1rem' }}>
                  <Clock size={16} /> Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  {assignment.submission && !editModes[assignment._id] ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                        <CheckCircle size={18} /> {assignment.submission.status === 'graded' ? `Graded: ${assignment.submission.grade}` : 'Submitted'}
                      </div>
                      
                      {assignment.submission.status === 'graded' && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                          <strong>Feedback:</strong> {assignment.submission.feedback || 'No feedback provided'}
                        </div>
                      )}

                      <a href={`http://localhost:5000${assignment.submission.fileUrl}`} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.85rem', alignSelf: 'flex-start' }}>
                        View Submitted File
                      </a>

                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem', fontSize: '0.85rem', marginTop: '0.5rem' }}
                        onClick={() => setEditModes({ ...editModes, [assignment._id]: true })}
                      >
                        Change File
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input type="file" onChange={handleFileChange} style={{ marginBottom: '0.5rem', width: '100%', fontSize: '0.85rem' }} />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-primary" 
                          style={{ flex: 1, padding: '0.5rem' }}
                          onClick={() => submitAssignment(assignment._id)}
                          disabled={uploadingId === assignment._id}
                        >
                          {uploadingId === assignment._id ? 'Uploading...' : <><Upload size={16} /> {assignment.submission ? 'Update Submission' : 'Submit Work'}</>}
                        </button>
                        {assignment.submission && (
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.5rem' }}
                            onClick={() => {
                              setSelectedFile(null);
                              setEditModes({ ...editModes, [assignment._id]: false });
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
