import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaDownload, FaPrint, FaArrowLeft } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Certificate = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const certificateRef = useRef();
  const [score, setScore] = useState(85); // Default score if none provided
  
  // Get employee name from localStorage
  const employeeName = localStorage.getItem('employeeName') || 'Test Participant';
  
  // Get the score from location state if available
  useEffect(() => {
    if (location.state && location.state.score) {
      setScore(location.state.score);
    }
  }, [location]);

  const currentDate = new Date();

  const getModuleName = (moduleId) => {
    const moduleNames = {
      'btp': 'SAP BTP',
      'abap': 'ABAP Development',
      'ewm': 'SAP EWM',
      'tm': 'SAP TM'
    };
    return moduleNames[moduleId] || moduleId;
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
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
      pdf.save(`${getModuleName(moduleId)}_Certificate.pdf`);
    });
  };

  const handleBackToModules = () => {
    navigate('/module-selection');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Artihcus Certificate</h1>
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
              onClick={handleBackToModules} 
              className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              <FaArrowLeft className="mr-2" /> Back
            </button>
          </div>
        </div>

        {/* Certificate */}
        <div
          ref={certificateRef}
          className="bg-white border-8 border-double border-gray-300 p-8 rounded-lg shadow-lg mb-8"
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
            <p className="text-2xl font-bold text-orange-500 mb-3">{getModuleName(moduleId)} Assessment</p>
            <p className="text-lg mb-8">with a score of</p>
            <div className="bg-orange-100 text-orange-800 border-2 border-orange-300 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
              <span className="text-3xl font-bold">{score}%</span>
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
        
        <div className="text-center text-gray-600">
          <p>This certificate validates that the participant has completed the assessment with the indicated score.</p>
          <p>Certificate ID: {moduleId.toUpperCase()}-{Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}</p>
        </div>
      </div>
    </div>
  );
};

export default Certificate; 