import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FaDownload, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
 
const Form16 = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    fetchDocuments();
  }, []);
 
  const fetchDocuments = async () => {
    try {
      const q = query(
        collection(db, 'form16Documents'),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().uploadedAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString()
      }));
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching Form 16 documents:', error);
      toast.error('Error loading Form 16 documents');
    } finally {
      setLoading(false);
    }
  };
 
  const handleDownload = (document) => {
    const link = document.createElement('a');
    link.href = document.data;
    link.download = document.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
 
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
 
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Form 16 Documents</h1>
 
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No Form 16 documents available.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {doc.name}
                </h3>
                <span className="text-sm text-gray-500">
                  {(doc.size / 1024).toFixed(2)} KB
                </span>
              </div>
 
              <div className="text-sm text-gray-600 mb-4">
                <p>Uploaded: {doc.date}</p>
                <p>Type: {doc.type}</p>
              </div>
 
              <div className="flex space-x-3">
                <a
                  href={doc.data}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <FaEye className="mr-2" />
                  View
                </a>
                <button
                  onClick={() => handleDownload(doc)}
                  className="flex-1 flex items-center justify-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
 
export default Form16;
 
 
 