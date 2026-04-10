import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './quizquestion.css';

const API = 'https://quiz-iis0.onrender.com';

const Quizquestion = () => {
  const navigate = useNavigate();
  const [quizMeta, setQuizMeta] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [quizKey, setQuizKey] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const meta = JSON.parse(sessionStorage.getItem('quizMeta') || 'null');
    if (!meta) { navigate('/description'); return; }
    setQuizMeta(meta);
    const total = parseInt(meta.totalQuestion);
    setQuestions(Array.from({ length: total }, (_, i) => ({
      id: i + 1,
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      answer: ''
    })));
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.option1 || !q.option2 || !q.option3 || !q.option4 || !q.answer) {
        setError(`Please fill all fields for Question ${i + 1}`);
        return;
      }
      const ans = parseInt(q.answer);
      if (ans < 1 || ans > 4) {
        setError(`Answer for Q${i + 1} must be 1, 2, 3, or 4`);
        return;
      }
    }
    setError('');
    setSubmitting(true);
    const email = localStorage.getItem('creator_email');
    try {
      const res = await fetch(`${API}/quiz/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizMeta.title,
          total_question: quizMeta.totalQuestion,
          pass_mark: quizMeta.passMark,
          duration: quizMeta.duration || null,
          email,
          questions,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setQuizKey(data.key);
        sessionStorage.removeItem('quizMeta');
      } else {
        setError(data.error || 'Failed to create quiz');
      }
    } catch {
      setError('Server error. Please try again.');
    }
    setSubmitting(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(quizKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (quizKey) {
    return (
      <div className='key-container'>
        <div className='key-box'>
          <h2>✅ Quiz Created!</h2>
          <p>Share this Quiz Key with participants:</p>
          <div className='key-display'>{quizKey}</div>
          <button className='copy-btn' onClick={handleCopy}>
            {copied ? '✅ Copied!' : '📋 Copy Key'}
          </button>
          <button className='back-btn' onClick={() => navigate('/create')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='question-container'>
      <h2 className='title'>Question Create</h2>
      {quizMeta && (
        <p className='subtitle'>
          Quiz: <strong>{quizMeta.title}</strong> — {quizMeta.totalQuestion} Questions
        </p>
      )}
      <form onSubmit={handleSubmit} className='form'>
        {questions.map((q, index) => (
          <div key={q.id} className='question-block'>
            <h3 className='q-label'>Question {q.id}</h3>
            <div className='form-group'>
              <label>Question:</label>
              <textarea
                value={q.question}
                onChange={(e) => handleChange(index, 'question', e.target.value)}
                placeholder={`Enter question ${q.id}`}
              />
            </div>
            {['option1', 'option2', 'option3', 'option4'].map((opt, oi) => (
              <div className='form-group' key={opt}>
                <label>Option {oi + 1}:</label>
                <input
                  type='text'
                  value={q[opt]}
                  onChange={(e) => handleChange(index, opt, e.target.value)}
                  placeholder={`Option ${oi + 1}`}
                />
              </div>
            ))}
            <div className='form-group'>
              <label>Answer (1-4):</label>
              <input
                type='number'
                min='1'
                max='4'
                value={q.answer}
                onChange={(e) => handleChange(index, 'answer', e.target.value)}
                placeholder='Enter correct option number (1-4)'
              />
            </div>
            {index < questions.length - 1 && <hr className='q-divider' />}
          </div>
        ))}

        {error && <p className='error'>{error}</p>}
        <button type='submit' className='submit-btn' disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </form>
    </div>
  );
};

export default Quizquestion;
