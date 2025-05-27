import React from 'react';
import {
  FaFileAlt,
  FaFileInvoiceDollar,
  FaRegFilePdf,
  FaBuilding
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
 
const cardData = [
  {
    title: 'Documents',
    icon: <FaFileAlt className="text-blue-500 text-3xl" />,
    description: 'View and manage your personal documents.',
    link: '/emp-docs'
  },
  {
    title: 'Payslips',
    icon: <FaFileInvoiceDollar className="text-green-500 text-3xl" />,
    description: 'Download monthly payslips securely.',
    link: '/emp-payslips'
  },
  {
    title: 'Form 16',
    icon: <FaRegFilePdf className="text-red-500 text-3xl" />,
    description: 'Access your Form 16 for income tax filing.',
    link: '/form16'
  },
  {
    title: 'Company Policies',
    icon: <FaBuilding className="text-purple-500 text-3xl" />,
    description: 'Browse official HR and company policies.',
    link: '/company-policies'
  }
];
 
const DocumentCenter = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Document Center</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="mb-4">{card.icon}</div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{card.title}</h2>
            <p className="text-sm text-gray-600 mb-2">{card.description}</p>
            <Link
              to={card.link}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              View All →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
 
export default DocumentCenter;
 
 