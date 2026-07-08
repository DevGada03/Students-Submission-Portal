import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, User, Lock, Building, UserCircle } from 'lucide-react';
import { API_BASE } from '../config';

const Login = () => {
  const [isStudent, setIsStudent] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Computer Science'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const role = isStudent ? 'student' : 'faculty';
    const payload = isRegistering ? { ...formData, role } : { email: formData.email, password: formData.password, role };

    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const res = await axios.post(`${API_BASE}${endpoint}`, payload);
      
      if (isRegistering) {
        setIsRegistering(false);
        setError('Registration successful! Please login.');
      } else {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate(isStudent ? '/student-dashboard' : '/faculty-dashboard');
      }
    } catch (err) {
      const serverError = err.response?.data?.error;
      const message = err.response?.data?.message;
      setError(serverError ? `${message}: ${serverError}` : (message || 'Something went wrong'));
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          {isStudent ? <BookOpen size={48} color="var(--primary)" /> : <UserCircle size={48} color="var(--secondary)" />}
        </div>
        <h2 className="title" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
          {isStudent ? 'Student Portal' : 'Faculty Portal'}
        </h2>
        <p className="subtitle" style={{ marginBottom: '1rem' }}>
          {isRegistering ? 'Create your account' : 'Login to your account'}
        </p>

        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '4px' }}>
          <button 
            type="button"
            className="btn" 
            style={{ flex: 1, background: isStudent ? 'var(--primary)' : 'transparent', padding: '0.5rem' }}
            onClick={() => setIsStudent(true)}
          >
            Student
          </button>
          <button 
            type="button"
            className="btn" 
            style={{ flex: 1, background: !isStudent ? 'var(--secondary)' : 'transparent', padding: '0.5rem' }}
            onClick={() => setIsStudent(false)}
          >
            Faculty
          </button>
        </div>
      </div>

      {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <div className="input-group">
            <label><User size={16} style={{ display: 'inline', marginRight: '0.25rem' }}/> Full Name</label>
            <input type="text" name="name" placeholder="Name Surname" value={formData.name} onChange={handleInputChange} required />
          </div>
        )}
        <div className="input-group">
          <label><User size={16} style={{ display: 'inline', marginRight: '0.25rem' }}/> Email Address</label>
          <input type="email" name="email" placeholder="XYZ@gmail.com" value={formData.email} onChange={handleInputChange} required />
        </div>
        <div className="input-group">
          <label><Lock size={16} style={{ display: 'inline', marginRight: '0.25rem' }}/> Password</label>
          <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required />
        </div>
        {isRegistering && (
          <div className="input-group">
            <label><Building size={16} style={{ display: 'inline', marginRight: '0.25rem' }}/> Department</label>
            <select name="department" value={formData.department} onChange={handleInputChange} required>
              <option value="Computer Science">Computer Science</option>
              <option value="IT">IT</option>
              <option value="VLSI">VLSI</option>
              <option value="AI&DS">AI&DS</option>
              <option value="CyberSecurity">CyberSecurity</option>
              <option value="ECS">ECS</option>
            </select>
          </div>
        )}

        <button type="submit" className={`btn ${isStudent ? 'btn-primary' : 'btn-primary'}`} style={{ width: '100%', marginTop: '1rem', background: !isStudent ? 'linear-gradient(135deg, var(--secondary), #be185d)' : '' }}>
          {isRegistering ? 'Sign Up' : 'Login'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        {isRegistering ? 'Already have an account? ' : 'Don\'t have an account? '}
        <span 
          style={{ color: isStudent ? 'var(--primary)' : 'var(--secondary)', cursor: 'pointer', fontWeight: '600' }} 
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? 'Login here' : 'Sign up here'}
        </span>
      </p>
    </div>
  );
};

export default Login;
