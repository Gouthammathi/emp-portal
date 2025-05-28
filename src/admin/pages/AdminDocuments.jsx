import React, { useState } from 'react';
 
const Documents = () => {
  const [files, setFiles] = useState([]);
 
  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files).map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      date: new Date().toLocaleDateString(),
    }));
    setFiles((prev) => [...uploadedFiles, ...prev]);
  };
 
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-semibold mb-6 text-indigo-700">Documents</h2>
 
      <div className="mb-6">
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-block bg-indigo-600 text-white px-6 py-3 rounded shadow hover:bg-indigo-700 transition"
        >
          Upload Documents
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
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
              </tr>
            </thead>
            <tbody>
              {files.map(({ id, name, size, type, date }) => (
                <tr key={id} className="border-b hover:bg-indigo-50">
                  <td className="py-4 px-6">{name}</td>
                  <td className="py-4 px-6">{type}</td>
                  <td className="py-4 px-6">{(size / 1024).toFixed(2)}</td>
                  <td className="py-4 px-6">{date}</td>
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
 
 