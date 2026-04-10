import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './quizattempt.css';

const API = 'https://quiz-iis0.onrender.com';

const QuizAttempt = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [saved, setSaved] = useState({});
  const [title, setTitle] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  const quizKey = sessionStorage.getItem('quizKey');
  const attempterEmail = localStorage.getItem('attempter_email');
  const attempterName = localStorage.getItem('attempter_username');

  useEffect(() => {
    if (!quizKey) { navigate('/start-quiz'); return; }
    const storedTitle = sessionStorage.getItem('quizTitle');
    const duration = sessionStorage.getItem('quizDuration');
    setTitle(storedTitle || 'Quiz');
    if (duration) setTimeLeft(parseInt(duration) * 60);

    fetch(`${API}/quiz/questions/?key=${quizKey}`)
      .then(r => r.json())
      .then(data => { setQuestions(data.questions || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) { handleFinish(); return; }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelect = (qId, optionNum) => {
    setAnswers(prev => ({ ...prev, [qId]: optionNum }));
  };

  const handleSave = (qId) => {
    if (answers[qId] === undefined) return;
    setSaved(prev => ({ ...prev, [qId]: true }));
  };

  const handleFinish = async () => {
    clearTimeout(timerRef.current);
    const payload = questions.map(q => ({
      question_id: q.id,
      selected: answers[q.id] || null,
    }));
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/quiz/submit/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: quizKey,
          answers: payload,
          attempter_name: attempterName,
          attempter_email: attempterEmail,
        }),
      });
      const data = await res.json();
      sessionStorage.setItem('attemptResult', JSON.stringify({ ...data, name: attempterName, title }));
      navigate('/attempt-result');
    } catch {
      alert('Submission failed. Please try again.');
    }
    setSubmitting(false);
  };

  const savedCount = Object.keys(saved).length;
  const totalQ = questions.length;

  if (loading) return <div className='loading'>Loading quiz...</div>;

  return (
    <div className='attempt-page'>
      {/* Header */}
      <div className='attempt-header'>
        <h2>{title}</h2>
        {timeLeft !== null && (
          <div className={`timer ${timeLeft < 60 ? 'danger' : ''}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className='progress-bar-wrap'>
        <div className='progress-info'>
          {savedCount} / {totalQ} answered
        </div>
        <div className='progress-bar'>
          <div className='progress-fill' style={{ width: `${totalQ > 0 ? (savedCount / totalQ) * 100 : 0}%` }}></div>
        </div>
        <div className='dot-indicators'>
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`dot ${saved[q.id] ? 'dot-saved' : answers[q.id] !== undefined ? 'dot-selected' : 'dot-empty'}`}
              title={`Q${i + 1}`}
            ></div>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className='questions-list'>
        {questions.map((q, index) => (
          <div key={q.id} className={`q-card ${saved[q.id] ? 'q-saved' : ''}`}>
            <p className='q-text'><strong>Q{index + 1}.</strong> {q.question}</p>
            <div className='options'>
              {[q.option1, q.option2, q.option3, q.option4].map((opt, oi) => (
                opt && (
                  <div
                    key={oi}
                    className={`option ${answers[q.id] === oi + 1 ? 'selected' : ''} ${saved[q.id] ? 'locked' : ''}`}
                    onClick={() => !saved[q.id] && handleSelect(q.id, oi + 1)}
                  >
                    <span className='opt-num'>{oi + 1}</span> {opt}
                  </div>
                )
              ))}
            </div>
            <button
              className='save-btn'
              onClick={() => handleSave(q.id)}
              disabled={saved[q.id] || answers[q.id] === undefined}
            >
              {saved[q.id] ? '✅ Saved' : 'Save'}
            </button>
          </div>
        ))}
      </div>

      {/* Finish */}
      <div className='finish-wrap'>
        {savedCount < totalQ && (
          <p className='warn-text'>⚠️ {totalQ - savedCount} question(s) not saved yet</p>
        )}
        <button
          className='finish-btn'
          onClick={handleFinish}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Finish Test'}
        </button>
      </div>
    </div>
  );
};

export default QuizAttempt;
