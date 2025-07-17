import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { data } from '../../assets/data.js';

const Quiz = () => {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lock, setLock] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [username, setUsername] = useState('');

  const Option1 = useRef(null);
  const Option2 = useRef(null);
  const Option3 = useRef(null);
  const Option4 = useRef(null);
  const Option_array = [Option1, Option2, Option3, Option4];

  const quizTitle = "General Quiz"; // ✅ Customize this for different quizzes

  useEffect(() => {
    const storedUser = sessionStorage.getItem('username') || 'Anonymous';
    setUsername(storedUser);
  }, []);

  const question = data[index];

  const selectOption = (e, ansIndex) => {
    if (lock) return;
    Option_array.forEach((opt) => {
      opt.current.classList.remove('bg-sky-200', 'border-blue-500', 'text-black');
    });
    e.target.classList.add('bg-sky-200', 'border-blue-500', 'text-black');
    setSelectedOption({ element: e.target, index: ansIndex });
  };

  const checkAns = () => {
    if (lock || !selectedOption) return;
    const { element, index: ans } = selectedOption;

    if (question.ans === ans) {
      element.classList.add('bg-green-700', 'text-white', 'border-green-900');
      setScore((prev) => prev + 1);
    } else {
      element.classList.add('bg-red-700', 'text-white', 'border-red-600');
      Option_array[question.ans - 1].current.classList.add('bg-green-700', 'text-white', 'border-green-900');
    }

    setLock(true);
  };

  const nextQuestion = () => {
    if (!lock && selectedOption) {
      checkAns();
      return;
    }

    if (index + 1 < data.length) {
      setIndex(index + 1);
    } else {
      setQuizCompleted(true);
    }

    setLock(false);
    setSelectedOption(null);
    Option_array.forEach((opt) =>
      opt.current.classList.remove(
        'bg-green-700', 'bg-red-700', 'bg-sky-200',
        'text-white', 'text-black', 'border-green-900',
        'border-red-600', 'border-blue-500'
      )
    );
  };

  const submitFeedback = async () => {
    if (!feedback.trim()) {
      alert("Please enter feedback.");
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/feedback', {
        username,
        message: feedback,
        quizTitle, // ✅ Include quiz title in feedback
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error('❌ Error submitting feedback:', err);
    }
  };

  const resetQuiz = () => {
    setIndex(0);
    setScore(0);
    setQuizCompleted(false);
    setFeedback('');
    setFeedbackSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-500 text-gray-800 flex flex-col justify-center gap-5 rounded-lg p-6 shadow-lg overflow-hidden">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">{quizTitle}</h1>
        <hr className="h-2 border-none bg-gray-800 rounded-lg" />

        {/* Quiz In Progress */}
        {!quizCompleted && (
          <>
            <h3 className="text-lg md:text-xl font-semibold mb-4">
              {index + 1}. {question.question}
            </h3>
            <ul className="space-y-3">
              {[Option1, Option2, Option3, Option4].map((ref, i) => (
                <li
                  key={i}
                  ref={ref}
                  onClick={(e) => selectOption(e, i + 1)}
                  className="flex items-center px-4 py-3 border border-red-900 rounded-lg text-base md:text-lg cursor-pointer transition-all duration-300 hover:bg-gray-300 select-none"
                >
                  {question[`option${i + 1}`]}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={checkAns}
                disabled={!selectedOption || lock}
                className="flex-1 py-2 px-4 bg-slate-700 text-white text-base font-medium rounded-full cursor-pointer transition-colors duration-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
              <button
                onClick={nextQuestion}
                className="flex-1 py-2 px-4 bg-slate-700 text-white text-base font-medium rounded-full cursor-pointer transition-colors duration-300 hover:bg-slate-800"
              >
                Next
              </button>
            </div>

            <div className="text-center text-base font-medium text-gray-800 mt-2">
              {index + 1} of {data.length} Questions | Score: {score}
            </div>
          </>
        )}

        {/* Quiz Completed and Feedback */}
        {quizCompleted && (
          <div className="text-center mt-10 w-full">
            <h2 className="text-xl md:text-2xl text-white mb-5">
              🎉 {username}, you scored {score} out of {data.length}!
            </h2>

            {!feedbackSubmitted ? (
              <div className="space-y-4">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Leave your feedback here..."
                  className="w-full p-3 rounded-md text-black resize-none"
                  rows={4}
                />
                <button
                  onClick={submitFeedback}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                >
                  Submit Feedback
                </button>
              </div>
            ) : (
              <p className="text-green-300 font-medium">✅ Thank you for your feedback!</p>
            )}

            <button
              onClick={resetQuiz}
              className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
