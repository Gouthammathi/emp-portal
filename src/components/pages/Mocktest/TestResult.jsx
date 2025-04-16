import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaDownload, FaPrint, FaExternalLinkAlt } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TestResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const certificateRef = useRef();
  
  const { score, totalQuestions, correctAnswers, module } = location.state || {
    score: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    module: 'Unknown'
  };

  // Get employee name from localStorage
  const employeeName = localStorage.getItem('employeeName') || 'Test Participant';

  const getModuleName = (moduleId) => {
    const moduleNames = {
      'btp': 'SAP BTP',
      'abap': 'ABAP Development',
      'ewm': 'SAP EWM',
      'tm': 'SAP TM'
    };
    return moduleNames[moduleId] || moduleId;
  };

  const getPassStatus = () => {
    return score >= 70;
  };

  const handleBackToModules = () => {
    navigate('/module-selection');
  };

  const printCertificate = () => {
    window.print();
  };

  const downloadCertificate = () => {
    const certificate = certificateRef.current;
    
    html2canvas(certificate, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 297; // A4 width in landscape
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${getModuleName(module)}_Certificate.pdf`);
    });
  };

  const viewCertificatePage = () => {
    navigate(`/certificate/${module}`, { state: { score } });
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const currentDate = new Date();

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Test Results Summary */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="bg-orange-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white">{getModuleName(module)} Test Results</h2>
          </div>
          
          <div className="p-6">
            <div className="text-center mb-8">
              {getPassStatus() ? (
                <div className="flex flex-col items-center">
                  <FaCheckCircle className="text-green-500 w-16 h-16 mb-4" />
                  <h3 className="text-2xl font-bold text-green-600">You Passed!</h3>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FaTimesCircle className="text-red-500 w-16 h-16 mb-4" />
                  <h3 className="text-2xl font-bold text-red-600">You Failed!</h3>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 mb-1">Score</p>
                <p className="text-3xl font-bold text-gray-800">{score.toFixed(1)}%</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 mb-1">Correct Answers</p>
                <p className="text-3xl font-bold text-gray-800">{correctAnswers} / {totalQuestions}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Passing Criteria</h4>
              <p className="text-gray-600">You need at least 70% to pass this test.</p>
            </div>
          </div>
        </div>

        {/* Certificate */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Your Certificate</h3>
            <div className="flex space-x-2">
              <button 
                onClick={printCertificate} 
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <FaPrint className="mr-2" /> Print
              </button>
              <button 
                onClick={downloadCertificate} 
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button 
                onClick={viewCertificatePage} 
                className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              >
                <FaExternalLinkAlt className="mr-2" /> View Certificate
              </button>
            </div>
          </div>

          <div
            ref={certificateRef}
            className="bg-white border-8 border-double border-gray-300 p-8 rounded-lg shadow-lg"
            style={{ 
              backgroundImage: "url('data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23f3f4f6' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E')",
              backgroundSize: "cover",
              position: "relative"
            }}
          >
            <div className="text-center">
              <div className="font-bold text-2xl text-gray-800 mb-2">ARTIHCUS COMPANY</div>
              <div className="text-lg text-gray-600 mb-2">Certificate of Completion</div>
              <div className="w-48 h-1 bg-orange-500 mx-auto mb-8"></div>
            </div>

            <div className="text-center mb-10">
              <p className="text-lg mb-1">This certifies that</p>
              <p className="text-2xl font-bold mb-1 text-gray-800 border-b-2 border-gray-300 inline-block px-8">{employeeName}</p>
              <p className="text-lg mt-3 mb-3">has successfully completed the</p>
              <p className="text-2xl font-bold text-orange-500 mb-3">{getModuleName(module)} Assessment</p>
              <p className="text-lg mb-8">with a score of</p>
              <div className="bg-orange-100 text-orange-800 border-2 border-orange-300 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
                <span className="text-3xl font-bold">{score.toFixed(0)}%</span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-12">
              <div className="text-center">
                <div className="w-40 border-t-2 border-gray-400 mb-2"></div>
                <p className="font-semibold">Date</p>
                <p>{formatDate(currentDate)}</p>
              </div>

              <div className="flex-shrink-0">
                <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="text-orange-500 fill-current opacity-50">
                  <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 86c-19.9 0-36-16.1-36-36s16.1-36 36-36 36 16.1 36 36-16.1 36-36 36z"/>
                  <path d="M50 22c-15.5 0-28 12.5-28 28s12.5 28 28 28 28-12.5 28-28-12.5-28-28-28zm0 44c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16z"/>
                  <circle cx="50" cy="50" r="6"/>
                </svg>
              </div>

              <div className="text-center">
                <div className="w-40 border-t-2 border-gray-400 mb-2"></div>
                <p className="font-semibold">Signature</p>
                <p className="font-script text-lg">Administrator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex gap-4">
          <button
            onClick={handleBackToModules}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg flex items-center justify-center"
          >
            <FaArrowLeft className="mr-2" /> Back to Modules
          </button>
          
          <button
            onClick={viewCertificatePage}
            className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg flex items-center justify-center"
          >
            <FaExternalLinkAlt className="mr-2" /> View Shareable Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResult; 