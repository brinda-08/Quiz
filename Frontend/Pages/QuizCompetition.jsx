import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function QuizCompetition() {
  const { id: competitionId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [resultLoading, setResultLoading] = useState(false);

  const username = sessionStorage.getItem('username');

  useEffect(() => {
    const fetchCompetitionAndQuiz = async () => {
      try {
        const compRes = await axios.get(`http://localhost:5000/api/competition/${competitionId}`);
        const competition = compRes.data.competition;

        if (!competition || !competition.quizId) {
          throw new Error("Invalid competition or missing quizId");
        }

        const quizRes = await axios.get(`http://localhost:5000/api/quizzes/${competition.quizId}`);

        setQuiz(quizRes.data);
        setQuestions(quizRes.data.questions || []);
        setUserAnswers(new Array(quizRes.data.questions?.length || 0).fill(null));

      } catch (err) {
        console.error("Error loading competition or quiz:", err);
        alert("Failed to load quiz. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (competitionId) {
      fetchCompetitionAndQuiz();
    } else {
      setLoading(false);
    }
  }, [competitionId]);

  const handleOptionSelect = (index) => {
    setSelectedIndex(index);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;

    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = selectedIndex;
    setUserAnswers(newUserAnswers);

    const correctIndex = questions[currentQuestion].correct;
    if (selectedIndex === correctIndex) {
      setScore(prevScore => prevScore + 1);
    }

    setSelectedIndex(null);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      let finalScore = 0;
      newUserAnswers.forEach((answer, index) => {
        if (answer === questions[index].correct) {
          finalScore++;
        }
      });
      setScore(finalScore);
      setQuizCompleted(true);
    }
  };

const handlesubmitScore = async () => {
  if (submitted) return;
  setSubmitting(true);

  try {
    let finalScore = 0;
    userAnswers.forEach((answerIdx, index) => {
      if (answerIdx === questions[index].correct) {
        finalScore++;
      }
    });

    await axios.post('http://localhost:5000/api/competition/submit-score', {
      competitionId,
      username,
      score: finalScore,
      totalQuestions: questions.length
    });

    setSubmitted(true);

    // Redirect to results page after successful submission
    navigate(`/competition/${competitionId}/result`);

  } catch (err) {
    console.error("Failed to submit score:", err);
    const errorMsg = err.response?.data?.msg || "Failed to submit score. Please try again.";
    alert(errorMsg);
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (!quiz || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 bg-gray-900">
        <p>Quiz not found or has no questions.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      {!quizCompleted ? (
        <div className="w-full max-w-2xl bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">{quiz.title}</h2>
          <p className="mb-2 text-sm text-gray-400">
            Question {currentQuestion + 1} of {questions.length}
          </p>
          <h3 className="text-xl mb-4">{questions[currentQuestion].text}</h3>

          <div className="space-y-2">
            {questions[currentQuestion].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                className={`block w-full px-4 py-2 rounded text-left transition-colors ${
                  selectedIndex === idx
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={selectedIndex === null}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {currentQuestion + 1 < questions.length ? 'Next Question' : 'Finish Quiz'}
          </button>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Quiz Completed!</h2>
          <p className="text-sm text-gray-400">
            Competing with: <strong>{quiz.competitor || 'Friend'}</strong>
          </p>

          {!submitted && (
            <button
              onClick={handlesubmitScore}
              disabled={submitting}
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting Score...' : 'Submit Score'}
            </button>
          )}

          {submitting && (
            <p className="text-blue-400 font-semibold">Submitting score...</p>
          )}

          {submitted && (
            <>
              <p className="text-green-400 font-semibold">✅ Score submitted successfully!</p>
              {resultLoading ? (
                <p className="text-gray-300">Loading result...</p>
              ) : result ? (
                result.error ? (
                  <p className="text-red-400">{result.error}</p>
                ) : (
                  <div className="mt-4 bg-gray-800 rounded p-4">
                    <h3 className="text-xl font-bold mb-2">Your Competition Result</h3>
                    <p><strong>Score:</strong> {result.score}</p>
                    <p><strong>Rank:</strong> {result.rank}</p>
                    {result.totalParticipants && (
                      <p><strong>Total Participants:</strong> {result.totalParticipants}</p>
                    )}
                  </div>
                )
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
}
