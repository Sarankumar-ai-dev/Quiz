import { BrowserRouter, Routes, Route } from "react-router-dom";
import Quizmain from './components/quizmain/Quizmain.jsx';
import Quizcreatermain from './components/quizcreatermain/Quizcreatermain.jsx';
import Quizdic from './components/quizdec/Quizdic.jsx';
import Quizquestion from './components/quizquestion/Quizquestion.jsx';
import QuizStart from './components/quizstart/QuizStart.jsx';
import QuizAttempt from './components/quizattempt/QuizAttempt.jsx';
import AttemptResult from './components/attemptresult/AttemptResult.jsx';
import QuizDetail from './components/quizdetail/QuizDetail.jsx';
import LoginPage from './components/auth/LoginPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Quizmain />} />
        <Route path='/login-creator' element={<LoginPage role="Quiz Creator" redirectTo="/create" />} />
        <Route path='/login-attempter' element={<LoginPage role="Quiz Attempter" redirectTo="/start-quiz" />} />
        <Route path='/create' element={<Quizcreatermain />} />
        <Route path='/description' element={<Quizdic />} />
        <Route path='/createQuestion' element={<Quizquestion />} />
        <Route path='/start-quiz' element={<QuizStart />} />
        <Route path='/attempt' element={<QuizAttempt />} />
        <Route path='/attempt-result' element={<AttemptResult />} />
        <Route path='/quiz-detail/:quizId' element={<QuizDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;