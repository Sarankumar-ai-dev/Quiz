import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './quizdic.css';

const Quizdic = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    totalQuestion: '',
    passMark: '',
    duration: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.totalQuestion || !formData.passMark) {
      setError('Please fill all required fields');
      return;
    }
    if (parseInt(formData.passMark) > parseInt(formData.totalQuestion)) {
      setError('Pass mark cannot exceed total questions');
      return;
    }
    setError('');
    sessionStorage.setItem('quizMeta', JSON.stringify(formData));
    navigate('/createQuestion');
  };

  return (
    <div className='form-container'>
      <h2>Create Quiz</h2>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          name='title'
          placeholder='Quiz Title'
          value={formData.title}
          onChange={handleChange}
        />
        <input
          type='number'
          name='totalQuestion'
          placeholder='Number of Questions'
          value={formData.totalQuestion}
          onChange={handleChange}
          min='1'
        />
        <input
          type='number'
          name='passMark'
          placeholder='Number of Correct Answers Required to Pass'
          value={formData.passMark}
          onChange={handleChange}
          min='1'
        />
        <input
          type='number'
          name='duration'
          placeholder='Duration in Minutes (Optional)'
          value={formData.duration}
          onChange={handleChange}
          min='1'
        />
        {error && <p className='error'>{error}</p>}
        <button type='submit'>Create Quiz</button>
      </form>
    </div>
  );
};

export default Quizdic;
