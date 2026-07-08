import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, LogOut, Users, BookOpen, Trash2 } from 'lucide-react';
import { API_BASE } from '../config';

const FacultyDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', deadline: '', department: 'Computer Science'
  });
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingData, setGradingData] = useState({ grade: '', feedback: '' });
  const [activeSubmissionId, setActiveSubmissionId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token || user?.role !== 'faculty') {
      navigate('/login');
      return;
    }
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createAssignment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/assignments`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowForm(false);
      fetchAssignments();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating assignment');
    }
  };

  const fetchSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setLoadingSubmissions(true);
    setPreviewUrl(null);
    try {
      const res = await axios.get(`${API_BASE}/api/submissions/assignment/${assignment._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(res.data);
      // Auto-preview first submission if available
      if (res.data.length > 0) {
        setPreviewUrl(res.data[0].fileData);
      }
    } catch (error) {
      alert('Error fetching submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const submitGrade = async (e, submissionId) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/submissions/${submissionId}/grade`, gradingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Graded successfully!');
      setActiveSubmissionId(null);
      setGradingData({ grade: '', feedback: '' });
      fetchSubmissions(selectedAssignment); // Refresh submissions list
    } catch (error) {
      alert('Error grading submission');
    }
  };

  const deleteAssignment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment and all its submissions?")) return;
    try {
      await axios.delete(`${API_BASE}/api/assignments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Assignment deleted successfully');
      fetchAssignments();
      if (selectedAssignment?._id === id) {
        setSelectedAssignment(null);
        setPreviewUrl(null);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting assignment');
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
          <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.2rem', backgroundImage: 'linear-gradient(to right, #ec4899, #be185d)' }}>Faculty Portal</h1>
          <p className="subtitle" style={{ margin: 0 }}>Welcome back, Prof. {user?.name}</p>
        </div>
        <button className="btn btn-outline" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={24} color="var(--secondary)" /> Assignments Created
        </h2>
        <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--secondary), #be185d)' }} onClick={() => setShowForm(!showForm)}>
          <PlusCircle size={18} /> {showForm ? 'Cancel' : 'New Assignment'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Create New Assignment</h3>
          <form onSubmit={createAssignment} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Assignment Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} required></textarea>
            </div>
            <div className="input-group">
              <label>Target Department</label>
              <select name="department" value={formData.department} onChange={handleInputChange} required>
                <option value="Computer Science">Computer Science</option>
                <option value="IT">IT</option>
                <option value="VLSI">VLSI</option>
                <option value="AI&DS">AI&DS</option>
                <option value="CyberSecurity">CyberSecurity</option>
                <option value="ECS">ECS</option>
              </select>
            </div>
            <div className="input-group">
              <label>Deadline</label>
              <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--secondary), #be185d)' }}>
                Publish Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedAssignment && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Submissions for: {selectedAssignment.title}</h3>
            <button className="btn btn-outline" onClick={() => { setSelectedAssignment(null); setPreviewUrl(null); }}>Close</button>
          </div>
          
          {loadingSubmissions ? (
            <p>Loading submissions...</p>
          ) : submissions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No submissions yet for this assignment.</p>
          ) : (
            <div style={{ display: 'flex', gap: '2rem', minHeight: '600px' }}>
              {/* Left Column: Submissions List */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '600px', paddingRight: '0.5rem' }}>
                {submissions.map(sub => (
                  <div 
                    key={sub._id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      background: previewUrl === sub.fileData ? 'rgba(236, 72, 153, 0.15)' : 'rgba(0,0,0,0.2)', 
                      padding: '1rem', 
                      borderRadius: '8px',
                      border: previewUrl === sub.fileData ? '1px solid var(--secondary)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setPreviewUrl(sub.fileData)}
                  >
                    <div>
                      <h4 style={{ margin: 0 }}>{sub.student?.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{sub.student?.email}</p>
                      <div style={{ marginTop: '0.5rem' }}>
                        <span style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: '600' }}>
                          Click to Preview PDF
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <span style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', background: sub.status === 'graded' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: sub.status === 'graded' ? 'var(--success)' : '#f59e0b', marginBottom: '0.5rem' }}>
                        {sub.status === 'graded' ? `Graded: ${sub.grade}` : 'Pending Grade'}
                      </span>
                      
                      {activeSubmissionId === sub._id ? (
                        <form onSubmit={(e) => submitGrade(e, sub._id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <input 
                            type="text" 
                            placeholder="Grade (e.g. A, 95)" 
                            value={gradingData.grade} 
                            onChange={(e) => setGradingData({ ...gradingData, grade: e.target.value })} 
                            required 
                            style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: '#000', border: '1px solid var(--border)', color: '#fff' }}
                          />
                          <input 
                            type="text" 
                            placeholder="Feedback" 
                            value={gradingData.feedback} 
                            onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })} 
                            style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: '#000', border: '1px solid var(--border)', color: '#fff' }}
                          />
                          <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem', fontSize: '0.8rem' }}>Submit Grade</button>
                        </form>
                      ) : (
                        <button 
                          className="btn btn-outline" 
                          style={{ display: 'block', padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginTop: '0.5rem', width: '100%' }} 
                          onClick={() => {
                            setActiveSubmissionId(sub._id);
                            setGradingData({ grade: sub.grade || '', feedback: sub.feedback || '' });
                          }}
                        >
                          {sub.status === 'graded' ? 'Edit Grade' : 'Grade Submission'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: PDF Preview Frame */}
              <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: '#1e293b' }}>
                {previewUrl ? (
                  <iframe 
                    src={previewUrl} 
                    title="PDF Submission Preview" 
                    style={{ width: '100%', height: '100%', border: 'none', minHeight: '580px' }} 
                  />
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    Select a student to preview their PDF submission
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p>Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          You haven't created any assignments yet.
        </div>
      ) : (
        <div className="grid-cards">
          {assignments.map(assignment => (
            <div key={assignment._id} className="glass-panel card" style={{ borderLeft: '4px solid var(--secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{assignment.title}</h3>
                <button 
                  onClick={() => deleteAssignment(assignment._id)} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}
                  title="Delete Assignment"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{assignment.description}</p>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#38bdf8' }}>
                  <Users size={16} /> {assignment.department}
                </span>
                <span style={{ color: '#f59e0b' }}>
                  Due: {new Date(assignment.deadline).toLocaleDateString()}
                </span>
              </div>
              
              <button 
                className="btn btn-outline" 
                style={{ marginTop: '1rem', padding: '0.5rem', width: '100%', borderColor: 'var(--secondary)', color: 'var(--text-light)' }}
                onClick={() => fetchSubmissions(assignment)}
              >
                View Submissions
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
