import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFlag } from 'react-icons/fi';

const ABAPTest = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes
  const [testCompleted, setTestCompleted] = useState(false);

  // Sample questions for ABAP test
  const questions = [
    {
      id: 1,
      question: "What is the purpose of the ABAP Dictionary?",
      options: [
        "To store and manage database tables",
        "To write ABAP programs",
        "To debug ABAP code",
        "To create user interfaces"
      ],
      correctAnswer: 0
    },
    {
      id: 2,
      question: "Which of the following is a valid ABAP data type?",
      options: [
        "INT",
        "STRING",
        "BOOLEAN",
        "All of the above"
      ],
      correctAnswer: 3
    },
    {
      id: 3,
      question: "What is the purpose of the SELECT statement in ABAP?",
      options: [
        "To insert data into database tables",
        "To retrieve data from database tables",
        "To update data in database tables",
        "To delete data from database tables"
      ],
      correctAnswer: 1
    },
    {
      id: 4,
      question: "Which of the following is a valid ABAP internal table type?",
      options: [
        "STANDARD TABLE",
        "SORTED TABLE",
        "HASHED TABLE",
        "All of the above"
      ],
      correctAnswer: 3
    },
    {
      id: 5,
      question: "What is the purpose of the MODIFY statement in ABAP?",
      options: [
        "To insert new records",
        "To update existing records",
        "To delete records",
        "To select records"
      ],
      correctAnswer: 1
    }
  ];

  useEffect(() => {
    // Initialize answers and status
    const initialAnswers = {};
    const initialStatus = {};
    questions.forEach(q => {
      initialAnswers[q.id] = null;
      initialStatus[q.id] = 'not-answered';
    });
    setAnswers(initialAnswers);
    setQuestionStatus(initialStatus);
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !testCompleted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !testCompleted) {
      handleSubmitTest();
    }
  }, [timeLeft, testCompleted]);

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
    if (questionStatus[questionId] !== 'marked-for-review') {
      setQuestionStatus(prev => ({
        ...prev,
        [questionId]: 'answered'
      }));
    }
  };

  const handleNavigate = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleMarkForReview = () => {
    const currentQuestionId = questions[currentQuestionIndex]?.id;
    if (currentQuestionId) {
      setQuestionStatus(prev => ({
        ...prev,
        [currentQuestionId]: 'marked-for-review'
      }));
    }
    if (currentQuestionIndex < questions.length - 1) {
      handleNavigate(currentQuestionIndex + 1);
    }
  };

  const handleSaveAndNext = () => {
    const currentQuestionId = questions[currentQuestionIndex]?.id;
    if (currentQuestionId) {
      setQuestionStatus(prev => ({
        ...prev,
        [currentQuestionId]: answers[currentQuestionId] !== null ? 'answered' : 'not-answered'
      }));
    }
    if (currentQuestionIndex < questions.length - 1) {
      handleNavigate(currentQuestionIndex + 1);
    }
  };

  const handleSubmitTest = () => {
    setTestCompleted(true);
    let correctAnswers = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    const percentage = (correctAnswers / questions.length) * 100;

    navigate('/mocktest/result', {
      state: {
        score: percentage,
        totalQuestions: questions.length,
        correctAnswers: correctAnswers,
        module: 'abap'
      }
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Timer */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">ABAP Development Test</h2>
            <div className="text-2xl font-bold text-red-600">
              Time Left: {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h3>
                <p className="text-gray-700">{currentQuestion.question}</p>
              </div>

              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                      answers[currentQuestion.id] === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      checked={answers[currentQuestion.id] === index}
                      onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                      className="h-5 w-5 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-4 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => handleNavigate(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md font-semibold disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  onClick={handleMarkForReview}
                  className="bg-[#ff6600] text-white px-6 py-3 rounded-md font-semibold"
                >
                  <FiFlag className="inline mr-2" /> Mark for Review & Next
                </button>

                <button
                  onClick={handleSaveAndNext}
                  className="bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-semibold"
                >
                  Save & Next
                </button>
              </div>
            </div>
          </div>

          {/* Question Navigation Sidebar */}
          <div className="w-80 bg-white shadow-md rounded-lg p-6 self-start">
            <h3 className="text-xl font-bold mb-6">Question Navigation</h3>
            
            <div className="grid grid-cols-5 gap-3 mb-8">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => handleNavigate(index)}
                  className={`w-10 h-10 flex items-center justify-center rounded-md ${
                    currentQuestionIndex === index ? 'border-2 border-[#ff6600]' :
                    questionStatus[q.id] === 'answered' ? 'bg-green-500 text-white' :
                    questionStatus[q.id] === 'marked-for-review' ? 'bg-[#ff6600] text-white' :
                    'bg-red-500 text-white'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                <span>Not Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#ff6600] rounded-full mr-3"></div>
                <span>Marked for Review</span>
              </div>
            </div>
            
            <button
              onClick={handleSubmitTest}
              className="w-full bg-red-500 text-white py-3 rounded-md font-bold"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ABAPTest;
