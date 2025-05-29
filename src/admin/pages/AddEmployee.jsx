import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import * as XLSX from 'xlsx';
import { FaUserPlus, FaFileUpload, FaUser, FaIdCard, FaEnvelope, FaPhone, FaBuilding, FaBriefcase, FaGraduationCap, FaFileAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ROLE_OPTIONS = [
  { value: 'employee', label: 'Employee' },
  { value: 'manager', label: 'Team Lead' },
  { value: 'supermanager', label: 'Manager' },
  { value: 'hr', label: 'HR' },
];

const AddEmployee = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const fileInputRef = useRef(null);

  const onSubmit = async (data) => {
    try {
      data.password = data.empId;
      await addDoc(collection(db, 'users'), data);
      toast.success('Employee added successfully!');
      reset();
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee');
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (jsonData.length > 0) {
        const row = jsonData[0];
        reset(row);
        toast.info('Form auto-filled from Excel. Please review before submitting.');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Add New Employee
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Fill in the details to add a new employee to the system
          </p>
        </div>

        {/* Excel Upload Section */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              onChange={handleExcelUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <FaFileUpload className="mr-2" />
              Upload Excel to Auto-Fill
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information */}
          <SectionCard
            title="Personal Information"
            icon={<FaUser className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                label="Employee ID"
                name="empId"
                register={register}
                required
                icon={<FaIdCard className="w-5 h-5" />}
                error={errors.empId}
              />
              <FormField
                label="First Name"
                name="firstName"
                register={register}
                required
                error={errors.firstName}
              />
              <FormField
                label="Last Name"
                name="lastName"
                register={register}
                required
                error={errors.lastName}
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                register={register}
                required
                icon={<FaEnvelope className="w-5 h-5" />}
                error={errors.email}
              />
              <FormField
                label="Phone"
                name="phone"
                register={register}
                required
                icon={<FaPhone className="w-5 h-5" />}
                error={errors.phone}
              />
              <FormField
                label="Date of Birth"
                name="dob"
                type="date"
                register={register}
                required
                error={errors.dob}
              />
            </div>
          </SectionCard>

          {/* Employment Details */}
          <SectionCard
            title="Employment Details"
            icon={<FaBriefcase className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                label="Department"
                name="department"
                register={register}
                required
                icon={<FaBuilding className="w-5 h-5" />}
                error={errors.department}
              />
              <FormField
                label="Designation"
                name="designation"
                register={register}
                required
                error={errors.designation}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="relative">
                  <select
                    {...register('role', { required: true })}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select a role</option>
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">Role is required</p>
                  )}
                </div>
              </div>
              <FormField
                label="Joining Date"
                name="joiningDate"
                type="date"
                register={register}
                required
                error={errors.joiningDate}
              />
              <FormField
                label="Manager ID"
                name="managerId"
                register={register}
                error={errors.managerId}
              />
            </div>
          </SectionCard>

          {/* Additional Information */}
          <SectionCard
            title="Additional Information"
            icon={<FaFileAlt className="w-6 h-6" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                label="Address"
                name="address"
                register={register}
                error={errors.address}
              />
              <FormField
                label="Emergency Contact"
                name="emergencyContact"
                register={register}
                error={errors.emergencyContact}
              />
              <FormField
                label="Blood Group"
                name="bloodGroup"
                register={register}
                error={errors.bloodGroup}
              />
            </div>
          </SectionCard>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <FaUserPlus className="mr-2" />
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Section Card Component
const SectionCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <div className="flex items-center mb-6">
      <div className="p-2 bg-indigo-100 rounded-lg">
        {icon}
      </div>
      <h2 className="ml-3 text-xl font-semibold text-gray-900">{title}</h2>
    </div>
    {children}
  </div>
);

// Form Field Component
const FormField = ({ label, name, register, required, type = 'text', icon, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        {...register(name, { required })}
        type={type}
        className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border ${
          error ? 'border-red-300' : 'border-gray-300'
        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
      />
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600">{label} is required</p>
    )}
  </div>
);

export default AddEmployee;
 
 