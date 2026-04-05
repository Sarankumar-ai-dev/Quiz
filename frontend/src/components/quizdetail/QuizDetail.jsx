import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './quizdetail.css';

const API = 'http://localhost:8000';

const QuizDetail = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/quiz/stats/${quizId}/`)
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [quizId]);

  if (loading) return <div className='loading-screen'>Loading...</div>;
  if (!stats) return <div className='loading-screen'>No data found.</div>;

  const { title, participants, passed, failed, percentage, ml_prediction } = stats;
  const passRate = participants > 0 ? Math.round((passed / participants) * 100) : 0;
  const failRate = 100 - passRate;

  const r = 60, cx = 80, cy = 80, circ = 2 * Math.PI * r;
  const passArc = (passRate / 100) * circ;

  return (
    <div className='detail-page'>
      <div className='detail-navbar'>
        <button className='back-btn' onClick={() => navigate('/create')}>← Back</button>
        <h2>{title}</h2>
      </div>

      <div className='stats-grid'>
        <div className='stat-card'>
          <div className='stat-number'>{participants}</div>
          <div className='stat-label'>Total Participants</div>
        </div>
        <div className='stat-card green'>
          <div className='stat-number'>{passed}</div>
          <div className='stat-label'>Passed</div>
        </div>
        <div className='stat-card red'>
          <div className='stat-number'>{failed}</div>
          <div className='stat-label'>Failed</div>
        </div>
        <div className='stat-card blue'>
          <div className='stat-number'>{percentage}%</div>
          <div className='stat-label'>Avg Score</div>
        </div>
      </div>

      <div className='charts-row'>
        {/* Donut chart */}
        <div className='chart-card'>
          <h3>Pass / Fail Rate</h3>
          <svg width='160' height='160' viewBox='0 0 160 160'>
            <circle cx={cx} cy={cy} r={r} fill='none' stroke='#ffcccc' strokeWidth='20' />
            <circle
              cx={cx} cy={cy} r={r} fill='none'
              stroke='rgb(49,121,49)' strokeWidth='20'
              strokeDasharray={`${passArc} ${circ}`}
              strokeDashoffset={circ / 4}
              strokeLinecap='round'
            />
            <text x={cx} y={cy - 8} textAnchor='middle' fontSize='18' fontWeight='bold' fill='#333'>{passRate}%</text>
            <text x={cx} y={cy + 14} textAnchor='middle' fontSize='11' fill='#888'>Pass Rate</text>
          </svg>
          <div className='legend'>
            <span className='legend-dot green-dot'></span> Passed ({passRate}%)
            <span className='legend-dot red-dot'></span> Failed ({failRate}%)
          </div>
        </div>

        {/* Bar chart */}
        <div className='chart-card'>
          <h3>Participants Overview</h3>
          <div className='bar-chart'>
            <div className='bar-group'>
              <div className='bar-wrap'>
                <div className='bar green-bar' style={{ height: `${participants > 0 ? 150 : 10}px` }}></div>
              </div>
              <div className='bar-label'>Total<br />{participants}</div>
            </div>
            <div className='bar-group'>
              <div className='bar-wrap'>
                <div className='bar green-bar' style={{ height: `${participants > 0 ? (passed / participants) * 150 : 10}px` }}></div>
              </div>
              <div className='bar-label'>Passed<br />{passed}</div>
            </div>
            <div className='bar-group'>
              <div className='bar-wrap'>
                <div className='bar red-bar' style={{ height: `${participants > 0 ? (failed / participants) * 150 : 10}px` }}></div>
              </div>
              <div className='bar-label'>Failed<br />{failed}</div>
            </div>
          </div>
        </div>

        <div className='chart-card ml-card'>
          <h3>🤖 ML Prediction</h3>
          {ml_prediction ? (
            <>
              <div className='ml-score'>{ml_prediction.predicted_pass_rate}%</div>
              <div className='ml-label'>Predicted Pass Rate for Next Batch</div>
              <div className='ml-insight'>{ml_prediction.insight}</div>
              <div className={`ml-badge ${ml_prediction.difficulty}`}>
                Difficulty: {ml_prediction.difficulty}
              </div>
            </>
          ) : (
            <p className='ml-na'>Not enough data yet.<br />Need more participants for prediction.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;
