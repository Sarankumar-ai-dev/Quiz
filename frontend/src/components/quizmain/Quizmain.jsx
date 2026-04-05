import React from 'react';
import './quizmain.css';
import { useNavigate } from "react-router-dom";
import { FaUserEdit } from "react-icons/fa";
import { FaClipboardList } from "react-icons/fa";

const Quizmain = () => {
  const navigate = useNavigate();

  const handleCreateQuiz = () => {
    const token = localStorage.getItem('creator_token');
    const expiry = localStorage.getItem('creator_token_expiry');
    if (token && expiry && Date.now() < parseInt(expiry)) {
      navigate('/create');
    } else {
      navigate('/login-creator');
    }
  };

  const handleStartQuiz = () => {
    const token = localStorage.getItem('attempter_token');
    const expiry = localStorage.getItem('attempter_token_expiry');
    if (token && expiry && Date.now() < parseInt(expiry)) {
      navigate('/start-quiz');
    } else {
      navigate('/login-attempter');
    }
  };

  return (
    <div className='container'>
      <h1>Quiz Craft</h1>
      <div className='card-container'>
        <div className='card'>
          <h2>Quiz Creater <FaUserEdit className='icon' /></h2>
          <p>Create and Share Quizzes</p>
          <button onClick={handleCreateQuiz}>Create Quiz</button>
        </div>
        <div className='card'>
          <h2>Quiz Attempter <FaClipboardList className='icon' /></h2>
          <p>Test Your Knowledge</p>
          <button onClick={handleStartQuiz}>Start Quiz</button>
        </div>
      </div>
    </div>
  );
};

export default Quizmain;
