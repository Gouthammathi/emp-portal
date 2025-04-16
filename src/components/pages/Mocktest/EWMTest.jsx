import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFlag } from 'react-icons/fi';
import { ewmQuestions } from './EWMQuestions';

const EWMTest = () => {
  const navigate = useNavigate();
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // Stores { questionId: selectedOptionIndex }
  const [questionStatus, setQuestionStatus] = useState({}); // Stores { questionId: 'answered' | 'not-answered' | 'marked-for-review' }
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes
  const [testCompleted, setTestCompleted] = useState(false);

  useEffect(() => {
    console.log("Loading questions from EWMQuestions.js", ewmQuestions.length);
    const shuffled = [...ewmQuestions].sort(() => 0.5 - Math.random());
    const questionsForTest = shuffled.slice(0, 30); // Select 30 questions
    console.log("Selected questions for test:", questionsForTest.length);
    setSelectedQuestions(questionsForTest);

    // Initialize answers and status
    const initialAnswers = {};
    const initialStatus = {};
    questionsForTest.forEach(q => {
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
      handleSubmitTest(); // Auto-submit when time runs out
    }
  }, [timeLeft, testCompleted]);

  const handleAnswerSelect = (questionId, optionIndex) => {
    console.log("Selected answer:", questionId, optionIndex);
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
    // Update status only if it wasn't marked for review
    if (questionStatus[questionId] !== 'marked-for-review') {
      setQuestionStatus(prev => ({
        ...prev,
        [questionId]: 'answered'
      }));
    }
  };

  const handleNavigate = (index) => {
    console.log("Navigating to question index:", index);
    if (index >= 0 && index < selectedQuestions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleMarkForReview = () => {
    const currentQuestionId = selectedQuestions[currentQuestionIndex]?.id;
    console.log("Marking for review:", currentQuestionId);
    if (currentQuestionId) {
      setQuestionStatus(prev => ({
        ...prev,
        [currentQuestionId]: 'marked-for-review'
      }));
    }
    // Move to next question
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      handleNavigate(currentQuestionIndex + 1);
    }
  };

  const handleSaveAndNext = () => {
    console.log("Save and next");
    const currentQuestionId = selectedQuestions[currentQuestionIndex]?.id;
    // Ensure status is marked answered if an answer was selected
    if (currentQuestionId && answers[currentQuestionId] !== null) {
      if (questionStatus[currentQuestionId] !== 'marked-for-review') {
        setQuestionStatus(prev => ({
          ...prev,
          [currentQuestionId]: 'answered'
        }));
      }
    }
    // Move to next question
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      handleNavigate(currentQuestionIndex + 1);
    }
  };

  const handleSubmitTest = () => {
    console.log("Submitting test");
    setTestCompleted(true);
    let correctAnswers = 0;
    selectedQuestions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    const percentage = (correctAnswers / selectedQuestions.length) * 100;
    
    // Log submission details for debugging
    console.log("Test submission:", {
      totalQuestions: selectedQuestions.length,
      correctAnswers,
      percentage
    });
    
    navigate('/mocktest/result', { 
      state: { 
        score: percentage,
        totalQuestions: selectedQuestions.length,
        correctAnswers: correctAnswers,
        module: 'ewm'  // Use lowercase to match module IDs in other components
      } 
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (selectedQuestions.length === 0) {
    console.log("No questions loaded yet");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading Test...</div>
      </div>
    );
  }

  const currentQuestion = selectedQuestions[currentQuestionIndex];
  const currentQId = currentQuestion.id;
  console.log("Rendering question:", currentQuestionIndex, currentQId, currentQuestion.question);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Header */}
      <div className="w-full bg-[#ff6600] text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="font-bold text-2xl">EWM Mock Test</div>
          <div className="text-lg">Question {currentQuestionIndex + 1} of {selectedQuestions.length}</div>
          <div className="flex flex-col items-end">
            <div className="text-sm">Time Remaining</div>
            <div className="text-2xl font-bold flex items-center">
              <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 container mx-auto mt-4 mb-8">
        {/* Main content - left side */}
        <div className="flex-grow bg-white shadow-md rounded-lg mr-4 p-6">
          <div className="mb-4 flex items-center">
            <div className="bg-[#ff6600] text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">{currentQuestionIndex + 1}</div>
            <h2 className="text-xl font-bold">Question {currentQuestionIndex + 1}</h2>
          </div>

          <div className="my-8 text-lg text-center">{currentQuestion.question}</div>

          <div className="space-y-4 mt-8">
            {currentQuestion.options.map((option, index) => (
              <label
                key={index}
                className={`block border rounded-lg p-4 cursor-pointer ${
                  answers[currentQId] === index ? 'border-[#ff6600] bg-orange-50' : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQId}`}
                  value={index}
                  checked={answers[currentQId] === index}
                  onChange={() => handleAnswerSelect(currentQId, index)}
                  className="mr-3"
                />
                {option}
              </label>
            ))}
          </div>

          <div className="mt-12 flex justify-between">
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

        {/* Question Navigation Sidebar - right side */}
        <div className="w-80 bg-white shadow-md rounded-lg p-6 self-start">
          <h3 className="text-xl font-bold mb-6">Question Navigation</h3>
          
          <div className="grid grid-cols-5 gap-3 mb-8">
            {selectedQuestions.map((q, index) => (
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
  );
};

export default EWMTest; 