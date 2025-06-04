import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
 
const Documents = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
 
  // Fetch existing documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);
 
  const fetchDocuments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'companyPolicies'));
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
        const docRef = await addDoc(collection(db, 'companyPolicies'), {
          name: file.name,
          type: file.type,
          size: file.size,
          data: fileData, // Store the base64 data
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
 
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-semibold mb-6 text-indigo-700">Company Policies</h2>
 
      <div className="mb-6">
        <label
          htmlFor="file-upload"
          className={`cursor-pointer inline-block ${
            uploading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
          } text-white px-6 py-3 rounded shadow transition`}
        >
          {uploading ? 'Uploading...' : 'Upload Policy Documents'}
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
        <p className="text-gray-500">No policy documents uploaded yet.</p>
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
                    <a
                      href={data}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      View
                    </a>
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
 
 
 