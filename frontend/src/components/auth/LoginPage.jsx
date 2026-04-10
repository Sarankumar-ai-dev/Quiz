import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './loginpage.css';

const API = 'https://quiz-iis0.onrender.com';
const LoginPage = ({ role, redirectTo }) => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const storageKey = role === 'Quiz Creator' ? 'creator' : 'attempter';
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/login/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          password: formData.password,
          role: role,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        saveSession(storageKey, formData.name, formData.email);
        navigate(redirectTo);
      } else {
        setError(data.error || data.message || 'Signup failed');
      }
    } catch {
      setError('Server error. Please try again.');
    }
    setLoading(false);
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/login/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: role,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        saveSession(storageKey, data.username, formData.email);
        navigate(redirectTo);
      } else {
        setError(data.error || data.message || 'Login failed');
      }
    } catch {
      setError('Server error. Please try again.');
    }
    setLoading(false);
  };

  const saveSession = (key, username, email) => {
    const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    localStorage.setItem(`${key}_token`, 'logged_in');
    localStorage.setItem(`${key}_token_expiry`, expiry.toString());
    localStorage.setItem(`${key}_username`, username);
    localStorage.setItem(`${key}_email`, email);
  };

  return (
    <div className='login-bg'>
      <div className='login-box'>
        <h2>{isSignup ? 'Sign Up' : 'Sign In'}</h2>
        <div className='role-badge'>{role}</div>

        {isSignup ? (
          <form onSubmit={handleSignup}>
            <input
              type='text'
              name='name'
              placeholder='Name'
              value={formData.name}
              onChange={handleChange}
            />
            <input
              type='email'
              name='email'
              placeholder='Email ID'
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type='password'
              name='password'
              placeholder='Password'
              value={formData.password}
              onChange={handleChange}
            />
            {error && <p className='error'>{error}</p>}
            <button type='submit' disabled={loading}>
              {loading ? 'Please wait...' : 'Sign Up'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <input
              type='email'
              name='email'
              placeholder='Email ID'
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type='password'
              name='password'
              placeholder='Password'
              value={formData.password}
              onChange={handleChange}
            />
            {error && <p className='error'>{error}</p>}
            <button type='submit' disabled={loading}>
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
          </form>
        )}

        <p className='toggle-text'>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span onClick={() => { setIsSignup(!isSignup); setError(''); }}>
            {isSignup ? 'Sign In' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
