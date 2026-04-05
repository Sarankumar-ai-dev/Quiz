import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './attemptresult.css';

const AttemptResult = () => {
  const navigate = useNavigate();
  const [showAnswers, setShowAnswers] = useState(false);
  const raw = sessionStorage.getItem('attemptResult');
  if (!raw) { 
    navigate('/'); 
    return null; 
  }
  const result = JSON.parse(raw);
  const { name, title, total_questions, correct, wrong, percentage, details, attended, skipped } = result;
  const passed = correct >= (result.pass_mark || 0);

  return (
    <div className='result-page'>
      <div className='result-header'>
        <h2>Quiz Results</h2>
        <p>{title}</p>
      </div>
      <div className='result-card'>
        <div className='result-name'>👤 {name}</div>
        <div className={`result-badge ${passed ? 'passed' : 'failed'}`}>
          {passed ? '🎉 PASSED' : '❌ FAILED'}
        </div>
        <div className='result-stats'>
          <div className='rs'>
            <div className='rs-num'>{total_questions}</div>
            <div className='rs-lbl'>Total</div>
          </div>
          <div className='rs'>
            <div className='rs-num green'>{correct}</div>
            <div className='rs-lbl'>Correct</div>
          </div>
          <div className='rs'>
            <div className='rs-num red'>{wrong}</div>
            <div className='rs-lbl'>Wrong</div>
          </div>
          <div className='rs'>
            <div className='rs-num orange'>{skipped || 0}</div>
            <div className='rs-lbl'>Skipped</div>
          </div>
          <div className='rs'>
            <div className='rs-num blue'>{percentage}%</div>
            <div className='rs-lbl'>Score</div>
          </div>
        </div>
        <div className='result-actions'>
          <button className='see-ans-btn' onClick={() => setShowAnswers(!showAnswers)}>
            {showAnswers ? 'Hide Answers' : 'See Answers'}
          </button>
          <button className='home-btn' onClick={() => { sessionStorage.clear(); navigate('/'); }}>
            Back to Home
          </button>
        </div>
      </div>
      {showAnswers && (
        <div className='answers-list'>
          {(details || []).map((d, i) => (
            <div key={i} className={`ans-card ${d.is_correct ? 'correct' : 'wrong'}`}>
              <p className='ans-q'><strong>Q{i + 1}:</strong> {d.question}</p>
              <p className='ans-selected'>
                Your Answer: <span className={d.is_correct ? 'green-text' : 'red-text'}>
                  {d.selected || 'Not answered'}
                </span>
              </p>
              {!d.is_correct && (
                <p className='ans-correct'>
                  Correct Answer: <span className='green-text'>{d.correct_answer}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default AttemptResult;
