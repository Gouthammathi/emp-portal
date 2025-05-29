import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { FaFileExcel, FaUpload } from 'react-icons/fa';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';

const EmployeeImport = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    setLoading(true);
    setError(null);

    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        if (jsonData.length === 0) {
          throw new Error('No data found in the Excel file');
        }

        // Validate required fields
        const requiredFields = ['empId', 'firstName', 'lastName', 'email', 'role'];
        const missingFields = requiredFields.filter(field => !jsonData[0][field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        setEmployeeData(jsonData[0]);
      } catch (err) {
        setError(err.message || 'Error processing file. Please make sure it\'s a valid Excel file.');
      }
      setLoading(false);
    };

    reader.onerror = () => {
      setError('Error reading file');
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const handleSave = async () => {
    if (!employeeData) return;

    try {
      setLoading(true);
      setError(null);

      // Add employee data to Firestore
      const docRef = await addDoc(collection(db, "users"), {
        ...employeeData,
        createdAt: serverTimestamp(),
        status: 'active'
      });

      // Reset form after successful save
      setEmployeeData(null);
      toast.success('Employee added successfully!');
    } catch (err) {
      console.error('Error saving employee:', err);
      setError('Failed to save employee data. Please try again.');
      toast.error('Failed to save employee data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Employee</h2>
          
          {/* Drag and Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'}`}
          >
            <input {...getInputProps()} />
            <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive
                ? 'Drop the Excel file here'
                : 'Drag and drop an Excel file here, or click to select'}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Supported formats: .xls, .xlsx
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Preview Data */}
          {employeeData && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Details Preview</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {Object.entries(employeeData).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-4 py-2 border-b last:border-b-0">
                    <span className="font-medium text-gray-700">{key}</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          {employeeData && (
            <div className="mt-6">
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save and Add Employee'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeImport; 