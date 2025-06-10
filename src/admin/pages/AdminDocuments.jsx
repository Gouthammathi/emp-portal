import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';
 
const Documents = () => {
  const [activeTab, setActiveTab] = useState('policies'); // 'policies' or 'form16'
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
 
  // Fetch existing documents on component mount and when tab changes
  useEffect(() => {
    fetchDocuments();
  }, [activeTab]);
 
  const fetchDocuments = async () => {
    try {
      const collectionName = activeTab === 'policies' ? 'companyPolicies' : 'form16Documents';
      const querySnapshot = await getDocs(collection(db, collectionName));
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().uploadedAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString()
      }));
      setFiles(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Error loading documents');
    }
  };
 
  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setUploading(true);
 
    try {
      for (const file of uploadedFiles) {
        // Convert file to base64
        const reader = new FileReader();
        const fileData = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
 
        // Add document to Firestore
        const collectionName = activeTab === 'policies' ? 'companyPolicies' : 'form16Documents';
        const docRef = await addDoc(collection(db, collectionName), {
          name: file.name,
          type: file.type,
          size: file.size,
          data: fileData,
          uploadedAt: serverTimestamp(),
          status: 'active'
        });
 
        // Update local state
        setFiles((prev) => [{
          id: docRef.id,
          name: file.name,
          type: file.type,
          size: file.size,
          data: fileData,
          date: new Date().toLocaleDateString(),
          status: 'active'
        }, ...prev]);
      }
      toast.success('Files uploaded successfully!');
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Error uploading files. Please try again.');
    } finally {
      setUploading(false);
    }
  };
 
  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const collectionName = activeTab === 'policies' ? 'companyPolicies' : 'form16Documents';
        await deleteDoc(doc(db, collectionName, documentId));
        setFiles(prevFiles => prevFiles.filter(file => file.id !== documentId));
        toast.success('Document deleted successfully');
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Failed to delete document');
      }
    }
  };
 
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-4 py-2 rounded ${
            activeTab === 'policies'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Policy Documents
        </button>
        <button
          onClick={() => setActiveTab('form16')}
          className={`px-4 py-2 rounded ${
            activeTab === 'form16'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Form 16 Documents
        </button>
      </div>
 
      <h2 className="text-3xl font-semibold mb-6 text-indigo-700">
        {activeTab === 'policies' ? 'Company Policies' : 'Form 16 Documents'}
      </h2>
 
      <div className="mb-6">
        <label
          htmlFor="file-upload"
          className={`cursor-pointer inline-block ${
            uploading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
          } text-white px-6 py-3 rounded shadow transition`}
        >
          {uploading ? 'Uploading...' : `Upload ${activeTab === 'policies' ? 'Policy' : 'Form 16'} Documents`}
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading}
        />
      </div>
 
      {files.length === 0 ? (
        <p className="text-gray-500">No documents uploaded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="py-3 px-6 text-left">File Name</th>
                <th className="py-3 px-6 text-left">Type</th>
                <th className="py-3 px-6 text-left">Size (KB)</th>
                <th className="py-3 px-6 text-left">Uploaded On</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map(({ id, name, size, type, date, data }) => (
                <tr key={id} className="border-b hover:bg-indigo-50">
                  <td className="py-4 px-6">{name}</td>
                  <td className="py-4 px-6">{type}</td>
                  <td className="py-4 px-6">{(size / 1024).toFixed(2)}</td>
                  <td className="py-4 px-6">{date}</td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-3">
                      <a
                        href={data}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(id)}
                        className="text-red-600 hover:text-red-800 flex items-center"
                      >
                        <FaTrash className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
 
export default Documents;
 
 
 
 