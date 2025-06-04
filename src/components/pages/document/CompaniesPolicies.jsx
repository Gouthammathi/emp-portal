import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { FaDownload, FaEye } from 'react-icons/fa';
 
const CompaniesPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
 
  useEffect(() => {
    fetchPolicies();
  }, []);
 
  const fetchPolicies = async () => {
    try {
      // Query companyPolicies collection for active policies
      const q = query(
        collection(db, 'companyPolicies'),
        where('status', '==', 'active')
      );
     
      const querySnapshot = await getDocs(q);
      const policyDocuments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().uploadedAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString()
      }));
     
      setPolicies(policyDocuments);
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast.error('Error loading company policies');
    } finally {
      setLoading(false);
    }
  };
 
  const handleDownload = (policy) => {
    const link = document.createElement('a');
    link.href = policy.data;
    link.download = policy.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
 
  const handleView = (policy) => {
    setSelectedPolicy(policy);
  };
 
  const closeViewer = () => {
    setSelectedPolicy(null);
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
      <h2 className="text-3xl font-semibold mb-6 text-indigo-700">Company Policies</h2>
     
      {policies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No policy documents available.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {policy.name}
                </h3>
                <span className="text-sm text-gray-500">
                  {(policy.size / 1024).toFixed(2)} KB
                </span>
              </div>
             
              <div className="text-sm text-gray-600 mb-4">
                <p>Uploaded: {policy.date}</p>
                <p>Type: {policy.type}</p>
              </div>
             
              <div className="flex space-x-3">
                <button
                  onClick={() => handleView(policy)}
                  className="flex-1 flex items-center justify-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <FaEye className="mr-2" />
                  View
                </button>
                <button
                  onClick={() => handleDownload(policy)}
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
 
      {/* PDF Viewer Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{selectedPolicy.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(selectedPolicy)}
                  className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={closeViewer}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={selectedPolicy.data}
                className="w-full h-full"
                title="PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default CompaniesPolicies;
 