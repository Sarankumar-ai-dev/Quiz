import React, { useState, useEffect, useRef } from 'react';
import './quizcreatemain.css';
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";

const API = 'https://quiz-iis0.onrender.com';

const Quizcreatermain = () => {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const avatarRef = useRef(null);

  const username = localStorage.getItem('creator_username') || 'User';
  const email = localStorage.getItem('creator_email') || '';
  const avatarLetter = email ? email[0].toUpperCase() : username[0].toUpperCase();

  useEffect(() => {
    fetchQuizzes();
    const handleClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setShowLogout(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch(`${API}/quiz/list/?email=${email}`);
      const data = await res.json();
      setQuizzes(data.quizzes || []);
    } catch {
      setQuizzes([]);
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await fetch(`${API}/quiz/delete/${quizId}/`, { method: 'DELETE' });
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    } catch {
      alert('Failed to delete');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('creator_token');
    localStorage.removeItem('creator_token_expiry');
    localStorage.removeItem('creator_username');
    localStorage.removeItem('creator_email');
    navigate('/');
  };

  return (
    <div className='page'>
      <div className='navbar'>
        <div className='nav-left'>
          <h2 className='user'>{username}</h2>
        </div>
        <div className='nav-right'>
          <button className='create-btn' onClick={() => navigate('/description')}>
            <FaPlus /> Create New
          </button>
          <div className='avatar-wrapper' ref={avatarRef}>
            <div
              className='avatar-circle'
              onClick={() => setShowLogout(!showLogout)}
              title={email}
            >
              {avatarLetter}
            </div>
            {showLogout && (
              <div className='logout-dropdown'>
                <p className='email-text'>{email}</p>
                <button className='logout-btn' onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='content'>
        <h2 className='heading'>List of Quizzes you have Taken</h2>
        <div className='list-header'>
          <h4>Title</h4>
          <h4 className='remove'>Remove</h4>
        </div>
        <hr />
        {quizzes.length === 0 && (
          <p className='no-quiz'>No quizzes yet. Click "Create New" to start!</p>
        )}
        {quizzes.map((quiz) => (
          <div key={quiz.id}>
            <div className='list-item'>
              <p onClick={() => navigate(`/quiz-detail/${quiz.id}`)}>{quiz.title}</p>
              <FaTrash className='delete-icon' onClick={() => handleDelete(quiz.id)} />
            </div>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Quizcreatermain;
