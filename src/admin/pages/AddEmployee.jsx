import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, writeBatch, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaIdCard, FaBriefcase, FaSave, FaArrowLeft, FaFileUpload, FaGraduationCap, FaMoneyBillWave, FaUniversity, FaCalendarAlt, FaVenusMars, FaHeartbeat, FaExclamationTriangle, FaMapMarkerAlt, FaFileAlt, FaNetworkWired, FaGlobe, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { parseExcelFile } from '../../utils/excelParser';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const API_URL = 'http://localhost:3001';

const ROLE_OPTIONS = [
  { value: 'employee', label: 'Employee' },
  { value: 'manager', label: 'Team Lead' },
  { value: 'supermanager', label: 'Manager' },
  { value: 'hr', label: 'HR' },
  { value: 'c-suite', label: 'C-Suite' }
];

const AddEmployee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    middleName: '',
    lastName: '',
    nickName: '',
    email: '',
    personalEmail: '',
    phone: '',
    extensionNumber: '',
    empId: '',
    employeeRefNumber: '',
    password: '',
    loginUsername: '',
    ipAddress: '',
    dateOfBirth: '',
    birthdayDate: '',
    gender: '',
    maritalStatus: '',
    marriageDate: '',
    fathersName: '',
    spouseName: '',
    bloodGroup: '',
    address: '',
    mainAddress: '',
    emergencyContact: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    isPhysicallyChallenged: false,
    isInternationalEmp: false,
    countryOfOrigin: '',
    mobileNumber: '',

    // Employment Information
    department: '',
    designation: '',
    role: '',
    status: 'active',
    joiningDate: '',
    confirmDate: '',
    probationPeriod: '',
    noticePeriod: '',
    cid: '',
    managerId: '',
    superManagerId: '',
    division: '',
    costCenter: '',
    grade: '',
    location: '',
    employeeNumberSeries: '',

    // Professional Information
    education: '',
    experience: '',
    skills: '',
    salary: '',
    salaryPaymentMode: '',

    // Bank Details
    bankDetails: {
      accountNumber: '',
      bankName: '',
      bankBranch: '',
      ifscCode: '',
      accountType: '',
      branchName: '',
      ddPayableAt: '',
      nameAsPerBankRecords: '',
      iban: ''
    },

    // Documents
    documents: {
      aadharNumber: '',
      aadharEnrolmentNo: '',
      aadharName: '',
      panNumber: '',
      passportNumber: '',
      drivingLicense: '',
      universalAccountNumber: ''
    },

    // Background Verification
    backgroundCheck: {
      status: '',
      verificationIndication: '',
      completedOn: '',
      agencyName: '',
      remarks: ''
    },

    // PF Details
    pfDetails: {
      isEligible: false,
      pfNumber: '',
      pfScheme: '',
      pfJoiningDate: '',
      isEligibleForExcessContribution: false,
      isEligibleForExcessEPSContribution: false,
      isExistingMember: false
    },

    // ESI Details
    esiDetails: {
      isEligible: false,
      esiNumber: '',
      isCoveredUnderLWF: false
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const importedData = await parseExcelFile(file);

      if (!importedData || importedData.length === 0) {
        toast.error('No employee data found in the Excel file');
        return;
      }

      // Get the first row of data
      const employeeData = importedData[0];

      // Validate only the most critical fields
      const requiredFields = ['firstName', 'lastName', 'email', 'empId'];
      const missingFields = requiredFields.filter(field => !employeeData[field]);

      if (missingFields.length > 0) {
        toast.warning(`Missing critical fields: ${missingFields.join(', ')}. Please fill these manually.`);
      }

      // Create a new form data object, preserving existing values for empty fields
      const newFormData = { ...formData };

      // Helper function to safely update nested objects
      const updateNestedObject = (obj, path, value) => {
        if (!value) return obj;
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((o, key) => o[key] = o[key] || {}, obj);
        target[lastKey] = value;
        return obj;
      };

      // Update all fields from Excel, preserving empty values
      Object.entries(employeeData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key.includes('.')) {
            updateNestedObject(newFormData, key, value);
          } else {
            newFormData[key] = value;
          }
        }
      });

      setFormData(newFormData);
      toast.success('Employee data imported successfully. Please review and add password before submitting.');

      // Scroll to the password field
      const passwordField = document.querySelector('input[name="password"]');
      if (passwordField) {
        passwordField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        passwordField.focus();
      }

    } catch (error) {
      console.error('Error importing file:', error);
      toast.error('Error importing file. Please check the file format and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.password) {
      toast.error('Please set a password before submitting');
      const passwordField = document.querySelector('input[name="password"]');
      if (passwordField) {
        passwordField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        passwordField.focus();
      }
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);

      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Create the employee record with all form data
      const employeeRecord = {
        uid: user.uid,
        ...formData, // Include all form data
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      };

      const batch = writeBatch(db);

      // Save to users collection
      batch.set(doc(db, "users", user.uid), employeeRecord);

      // Add to orgChart collection
      const orgChartRef = doc(collection(db, 'orgChart'));
      batch.set(orgChartRef, {
        empId: formData.empId,
        employeeName: `${formData.firstName} ${formData.lastName}`,
        managerId: formData.managerId || null,
        SupermanagerId: formData.superManagerId || null,
        department: formData.department,
        designation: formData.designation,
        image: `/image/Employee/${formData.empId}.jpg`,
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
        cid: formData.cid || null
      });

      if (formData.role === 'manager') {
        const teamRef = doc(collection(db, 'teams'));
        batch.set(teamRef, {
          teamLeadId: formData.empId,
          teamLeadName: `${formData.firstName} ${formData.lastName}`,
          teamLeadRole: formData.role,
          createdAt: new Date().toISOString(),
          createdBy: 'admin'
        });
      }

      if (formData.role === 'hr') {
        const hrDataRef = doc(collection(db, 'hrData'));
        batch.set(hrDataRef, {
          hrId: formData.empId,
          hrName: `${formData.firstName} ${formData.lastName}`,
          createdAt: new Date().toISOString(),
          createdBy: 'admin'
        });
      }

      await batch.commit();
      toast.success('Employee added successfully');

      // Redirect to the employees list after successful submission
      navigate('/admin/A-employees');

      // Reset form data after successful submission
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        nickName: '',
        email: '',
        personalEmail: '',
        phone: '',
        extensionNumber: '',
        empId: '',
        employeeRefNumber: '',
        password: '',
        loginUsername: '',
        ipAddress: '',
        dateOfBirth: '',
        birthdayDate: '',
        gender: '',
        maritalStatus: '',
        marriageDate: '',
        fathersName: '',
        spouseName: '',
        bloodGroup: '',
        address: '',
        mainAddress: '',
        emergencyContact: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
        isPhysicallyChallenged: false,
        isInternationalEmp: false,
        countryOfOrigin: '',
        mobileNumber: '',
        department: '',
        designation: '',
        role: '',
        status: 'active',
        joiningDate: '',
        confirmDate: '',
        probationPeriod: '',
        noticePeriod: '',
        cid: '',
        managerId: '',
        superManagerId: '',
        division: '',
        costCenter: '',
        grade: '',
        location: '',
        employeeNumberSeries: '',
        education: '',
        experience: '',
        skills: '',
        salary: '',
        salaryPaymentMode: '',
        bankDetails: {
          accountNumber: '',
          bankName: '',
          bankBranch: '',
          ifscCode: '',
          accountType: '',
          branchName: '',
          ddPayableAt: '',
          nameAsPerBankRecords: '',
          iban: ''
        },
        documents: {
          aadharNumber: '',
          aadharEnrolmentNo: '',
          aadharName: '',
          panNumber: '',
          passportNumber: '',
          drivingLicense: '',
          universalAccountNumber: ''
        },
        backgroundCheck: {
          status: '',
          verificationIndication: '',
          completedOn: '',
          agencyName: '',
          remarks: ''
        },
        pfDetails: {
          isEligible: false,
          pfNumber: '',
          pfScheme: '',
          pfJoiningDate: '',
          isEligibleForExcessContribution: false,
          isEligibleForExcessEPSContribution: false,
          isExistingMember: false
        },
        esiDetails: {
          isEligible: false,
          esiNumber: '',
          isCoveredUnderLWF: false
        }
      });

    } catch (error) {
      console.error('Error adding employee:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Error: The email address is already in use by another account.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Error: The email address is not valid.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Error: The password is too weak. Minimum 6 characters required.');
      } else {
        toast.error(`Failed to add employee: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/pages/A-employees')}
                className="text-gray-600 hover:text-gray-900"
              >
                <FaArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Add New Employee</h1>
                <p className="mt-1 text-sm text-gray-500">Enter employee information</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <FaFileUpload className="mr-2" />
                  Import from Excel
                </label>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <FaSave className="mr-2" />
                {loading ? 'Saving...' : 'Save Employee'}
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaUser className="mr-2 text-indigo-600" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Employee ID *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="empId"
                    value={formData.empId}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>

                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaHeartbeat className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Emergency Contact *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaExclamationTriangle className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700">Present Address *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700">Nick Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="nickName"
                    value={formData.nickName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Personal Email</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="personalEmail"
                    value={formData.personalEmail}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Extension Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="extensionNumber"
                    value={formData.extensionNumber}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Employee Ref Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="employeeRefNumber"
                    value={formData.employeeRefNumber}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Birthday Date</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="birthdayDate"
                    value={formData.birthdayDate}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Marriage Date</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="marriageDate"
                    value={formData.marriageDate}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="fathersName"
                    value={formData.fathersName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Spouse Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="spouseName"
                    value={formData.spouseName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Login Username</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="loginUsername"
                    value={formData.loginUsername}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">IP Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaNetworkWired className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="ipAddress"
                    value={formData.ipAddress}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700">Permanent Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="mainAddress"
                    value={formData.mainAddress}
                    onChange={handleInputChange}
                    rows="3"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Emergency Contact Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="emergencyContactNumber"
                    value={formData.emergencyContactNumber}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPhysicallyChallenged"
                  checked={formData.isPhysicallyChallenged}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPhysicallyChallenged: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Is Physically Challenged</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isInternationalEmp"
                  checked={formData.isInternationalEmp}
                  onChange={(e) => setFormData(prev => ({ ...prev, isInternationalEmp: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Is International Employee</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Country of Origin</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaGlobe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="countryOfOrigin"
                    value={formData.countryOfOrigin}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Employment Information Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaBriefcase className="mr-2 text-indigo-600" />
              Employment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Department *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Designation *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBriefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a role</option>
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Joining Date *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">CID </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="cid"
                    value={formData.cid}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Manager ID</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="managerId"
                    value={formData.managerId}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Super Manager ID</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="superManagerId"
                    value={formData.superManagerId}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Date</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="confirmDate"
                    value={formData.confirmDate}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Probation Period (months)</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="probationPeriod"
                    value={formData.probationPeriod}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notice Period (days)</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="noticePeriod"
                    value={formData.noticePeriod}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Division</label>
                <input
                  type="text"
                  name="division"
                  value={formData.division}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cost Center</label>
                <input
                  type="text"
                  name="costCenter"
                  value={formData.costCenter}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Grade</label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Employee Number Series</label>
                <input
                  type="text"
                  name="employeeNumberSeries"
                  value={formData.employeeNumberSeries}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaGraduationCap className="mr-2 text-indigo-600" />
              Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700">Education *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                    <FaGraduationCap className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter education details (Degree, Institution, Year)"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700">Experience *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                    <FaBriefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter work experience details (Company, Role, Duration)"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700">Skills *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter skills (comma-separated)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Salary *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMoneyBillWave className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaUniversity className="mr-2 text-indigo-600" />
              Bank Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMoneyBillWave className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="bankDetails.accountNumber"
                    value={formData.bankDetails.accountNumber}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Name *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUniversity className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="bankDetails.bankName"
                    value={formData.bankDetails.bankName}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">IFSC Code *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMoneyBillWave className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="bankDetails.ifscCode"
                    value={formData.bankDetails.ifscCode}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Account Type *</label>
                <select
                  name="bankDetails.accountType"
                  value={formData.bankDetails.accountType}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select account type</option>
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                  <option value="salary">Salary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Branch Name *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUniversity className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="bankDetails.branchName"
                    value={formData.bankDetails.branchName}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Branch</label>
                <input
                  type="text"
                  name="bankDetails.bankBranch"
                  value={formData.bankDetails.bankBranch}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Salary Payment Mode</label>
                <select
                  name="salaryPaymentMode"
                  value={formData.salaryPaymentMode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select payment mode</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">DD Payable At</label>
                <input
                  type="text"
                  name="bankDetails.ddPayableAt"
                  value={formData.bankDetails.ddPayableAt}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Name as per Bank Records</label>
                <input
                  type="text"
                  name="bankDetails.nameAsPerBankRecords"
                  value={formData.bankDetails.nameAsPerBankRecords}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">IBAN</label>
                <input
                  type="text"
                  name="bankDetails.iban"
                  value={formData.bankDetails.iban}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaFileAlt className="mr-2 text-indigo-600" />
              Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Aadhar Number *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="documents.aadharNumber"
                    value={formData.documents.aadharNumber}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">PAN Number *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="documents.panNumber"
                    value={formData.documents.panNumber}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Passport Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="documents.passportNumber"
                    value={formData.documents.passportNumber}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Driving License</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="documents.drivingLicense"
                    value={formData.documents.drivingLicense}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Aadhaar Card Enrolment No</label>
                <input
                  type="text"
                  name="documents.aadharEnrolmentNo"
                  value={formData.documents.aadharEnrolmentNo}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Name (As on Aadhaar Card)</label>
                <input
                  type="text"
                  name="documents.aadharName"
                  value={formData.documents.aadharName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Universal Account Number</label>
                <input
                  type="text"
                  name="documents.universalAccountNumber"
                  value={formData.documents.universalAccountNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Background Verification Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaFileAlt className="mr-2 text-indigo-600" />
              Background Verification
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="backgroundCheck.status"
                  value={formData.backgroundCheck.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Verification Indication</label>
                <input
                  type="text"
                  name="backgroundCheck.verificationIndication"
                  value={formData.backgroundCheck.verificationIndication}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Completed On</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="backgroundCheck.completedOn"
                    value={formData.backgroundCheck.completedOn}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Agency Name</label>
                <input
                  type="text"
                  name="backgroundCheck.agencyName"
                  value={formData.backgroundCheck.agencyName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                <textarea
                  name="backgroundCheck.remarks"
                  value={formData.backgroundCheck.remarks}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
            </div>
          </div>

          {/* PF Details Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaMoneyBillWave className="mr-2 text-indigo-600" />
              PF Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="pfDetails.isEligible"
                  checked={formData.pfDetails.isEligible}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pfDetails: { ...prev.pfDetails, isEligible: e.target.checked }
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Is Employee Eligible for PF</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">PF Number</label>
                <input
                  type="text"
                  name="pfDetails.pfNumber"
                  value={formData.pfDetails.pfNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">PF Scheme</label>
                <input
                  type="text"
                  name="pfDetails.pfScheme"
                  value={formData.pfDetails.pfScheme}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">PF Joining Date</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="pfDetails.pfJoiningDate"
                    value={formData.pfDetails.pfJoiningDate}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="pfDetails.isEligibleForExcessContribution"
                  checked={formData.pfDetails.isEligibleForExcessContribution}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pfDetails: { ...prev.pfDetails, isEligibleForExcessContribution: e.target.checked }
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Eligible for Excess EPF Contribution</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="pfDetails.isEligibleForExcessEPSContribution"
                  checked={formData.pfDetails.isEligibleForExcessEPSContribution}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pfDetails: { ...prev.pfDetails, isEligibleForExcessEPSContribution: e.target.checked }
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Is Employee Eligible for Excess EPS Contribution</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="pfDetails.isExistingMember"
                  checked={formData.pfDetails.isExistingMember}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pfDetails: { ...prev.pfDetails, isExistingMember: e.target.checked }
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Is Existing Member of PF</label>
              </div>
            </div>
          </div>

          {/* ESI Details Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaMoneyBillWave className="mr-2 text-indigo-600" />
              ESI Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="esiDetails.isEligible"
                  checked={formData.esiDetails.isEligible}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    esiDetails: { ...prev.esiDetails, isEligible: e.target.checked }
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Is Employee Eligible for ESI</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ESI Number</label>
                <input
                  type="text"
                  name="esiDetails.esiNumber"
                  value={formData.esiDetails.esiNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="esiDetails.isCoveredUnderLWF"
                  checked={formData.esiDetails.isCoveredUnderLWF}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    esiDetails: { ...prev.esiDetails, isCoveredUnderLWF: e.target.checked }
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Is Employee Covered Under LWF</label>
              </div>
            </div>
          </div>

          {/* Account Setup Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FaUser className="mr-2 text-indigo-600" />
              Account Setup
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Password *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/pages/A-employees')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;

