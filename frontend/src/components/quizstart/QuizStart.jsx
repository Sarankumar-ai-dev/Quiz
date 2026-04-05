import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './quizstart.css';

const API = 'http://localhost:8000';

const QuizStart = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!key.trim()) { setError('Please enter a quiz key'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/quiz/validate-key/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem('quizKey', key.trim());
        sessionStorage.setItem('quizTitle', data.title);
        sessionStorage.setItem('quizDuration', data.duration || '');
        navigate('/attempt');
      } else {
        setError(data.error || 'Invalid quiz key');
      }
    } catch {
      setError('Server error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className='start-bg'>
      <div className='start-box'>
        <h2>Start Quiz</h2>
        <p>Enter your Quiz Key to begin</p>
        <input
          type='text'
          placeholder='Paste Quiz Key here'
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
        />
        {error && <p className='error'>{error}</p>}
        <button onClick={handleStart} disabled={loading}>
          {loading ? 'Checking...' : 'Enter Quiz →'}
        </button>
      </div>
    </div>
  );
};

export default QuizStart;
