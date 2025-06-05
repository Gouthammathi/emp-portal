import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where, getDocs as getFirestoreDocs, writeBatch, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaEdit, FaTrash, FaSearch, FaPlus, FaUserEdit, FaFilter, FaTimes, FaTasks, FaUserMinus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
 
const ROLE_OPTIONS = [
  { value: 'employee', label: 'Employee' },
  { value: 'manager', label: 'Team Lead' },
  { value: 'supermanager', label: 'Manager' },
  { value: 'hr', label: 'HR' },
  { value: 'c-suite', label: 'C-Suite' }
];
 
const PREDEFINED_PROJECTS = [
  {
    name: 'VMM',
    description: 'Variable Message Management System Project'
  },
  {
    name: 'Daikin',
    description: 'Daikin Air Conditioning Systems Project'
  },
  {
    name: 'Danfoss',
    description: 'Danfoss Industrial Solutions Project'
  }
];
 
const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    department: '',
    status: '',
  });
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();
 
  useEffect(() => {
    fetchEmployees();
    fetchProjects();
  }, []);
 
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      // Filter out users with the role 'client'
      const q = query(collection(db, 'users'), where('role', '!=', 'client'));
      const querySnapshot = await getDocs(q);
      const employeesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(employeesData);
      setFilteredEmployees(employeesData);
     
      // Extract unique departments
      const uniqueDepartments = [...new Set(employeesData.map(emp => emp.department))].filter(Boolean);
      setDepartments(uniqueDepartments);
     
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
      setLoading(false);
    }
  };
 
  const fetchProjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projectList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectList);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    }
  };
 
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };
 
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
 
  const clearFilters = () => {
    setFilters({
      role: '',
      department: '',
      status: '',
    });
  };
 
  const filteredEmployees = employees.filter(employee => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      employee.firstName?.toLowerCase().includes(searchTermLower) ||
      employee.lastName?.toLowerCase().includes(searchTermLower) ||
      employee.empId?.toLowerCase().includes(searchTermLower) ||
      employee.email?.toLowerCase().includes(searchTermLower) ||
      employee.department?.toLowerCase().includes(searchTermLower) ||
      employee.designation?.toLowerCase().includes(searchTermLower);
 
    const matchesRole = !filters.role || employee.role === filters.role;
    const matchesDepartment = !filters.department || employee.department === filters.department;
    const matchesStatus = !filters.status || employee.status === filters.status;
 
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });
 
  const handleEdit = (employee) => {
    navigate(`/admin/A-employees/edit/${employee.id}`);
  };
 
  const handleDelete = (employee) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };
 
  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'users', selectedEmployee.id));
      toast.success('Employee deleted successfully');
      setIsDeleteModalOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };
 
  const verifyRoleUpdate = async (userId, expectedRole) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role === expectedRole;
      }
      return false;
    } catch (error) {
      console.error('Error verifying role update:', error);
      return false;
    }
  };
 
  const handleUpdate = async (updatedData) => {
    try {
      const employeeRef = doc(db, 'users', selectedEmployee.id);
      const oldRole = selectedEmployee.role;
      const newRole = updatedData.role;
 
      // Validate role
      if (!ROLE_OPTIONS.some(option => option.value === newRole)) {
        toast.error('Invalid role selected');
        return;
      }
 
      // Start a batch write for atomic updates
      const batch = writeBatch(db);
 
      // Update the main user document
      const updateData = {
        ...updatedData,
        role: newRole,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin',
        lastRoleChange: oldRole !== newRole ? new Date().toISOString() : selectedEmployee.lastRoleChange,
        roleHistory: [
          ...(selectedEmployee.roleHistory || []),
          {
            from: oldRole,
            to: newRole,
            timestamp: new Date().toISOString(),
            changedBy: 'admin'
          }
        ]
      };
 
      batch.update(employeeRef, updateData);
 
      // If role is being changed, update related collections
      if (oldRole !== newRole) {
        // Update org chart
        const orgChartQuery = query(collection(db, 'orgChart'), where('empId', '==', selectedEmployee.empId));
        const orgChartSnapshot = await getFirestoreDocs(orgChartQuery);
       
        if (!orgChartSnapshot.empty) {
          const orgChartDoc = orgChartSnapshot.docs[0];
          batch.update(doc(db, 'orgChart', orgChartDoc.id), {
            role: newRole,
            title: updatedData.designation || selectedEmployee.designation,
            updatedAt: new Date().toISOString()
          });
        }
 
        // Update team assignments (for team leads)
        if (oldRole === 'manager' || newRole === 'manager') {
          const teamsQuery = query(collection(db, 'teams'), where('teamLeadId', '==', selectedEmployee.empId));
          const teamsSnapshot = await getFirestoreDocs(teamsQuery);
         
          if (!teamsSnapshot.empty) {
            const teamDoc = teamsSnapshot.docs[0];
            if (newRole === 'manager') {
              batch.update(doc(db, 'teams', teamDoc.id), {
                teamLeadName: `${updatedData.firstName} ${updatedData.lastName}`,
                teamLeadRole: newRole,
                updatedAt: new Date().toISOString()
              });
            } else {
              batch.update(doc(db, 'teams', teamDoc.id), {
                teamLeadId: null,
                teamLeadName: null,
                teamLeadRole: null,
                updatedAt: new Date().toISOString()
              });
            }
          }
        }
 
        // Update manager assignments (for managers)
        if (oldRole === 'supermanager' || newRole === 'supermanager') {
          const managedEmployeesQuery = query(collection(db, 'users'), where('managerId', '==', selectedEmployee.empId));
          const managedEmployeesSnapshot = await getFirestoreDocs(managedEmployeesQuery);
         
          if (!managedEmployeesSnapshot.empty) {
            if (newRole !== 'supermanager') {
              managedEmployeesSnapshot.docs.forEach(doc => {
                batch.update(doc.ref, {
                  managerId: null,
                  updatedAt: new Date().toISOString()
                });
              });
            }
          }
        }
 
        // Update HR assignments
        if (oldRole === 'hr' || newRole === 'hr') {
          const hrDataQuery = query(collection(db, 'hrData'), where('hrId', '==', selectedEmployee.empId));
          const hrDataSnapshot = await getFirestoreDocs(hrDataQuery);
         
          if (!hrDataSnapshot.empty) {
            if (newRole !== 'hr') {
              hrDataSnapshot.docs.forEach(doc => {
                batch.update(doc.ref, {
                  hrId: null,
                  updatedAt: new Date().toISOString()
                });
              });
            }
          }
        }
      }
 
      // Commit all updates
      await batch.commit();
 
      // Verify the role update
      const isRoleUpdated = await verifyRoleUpdate(selectedEmployee.id, newRole);
      if (!isRoleUpdated) {
        throw new Error('Role update verification failed');
      }
 
      toast.success('Employee updated successfully');
      setIsEditModalOpen(false);
      fetchEmployees();
 
      if (oldRole !== newRole) {
        toast.info(`Employee role changed from ${oldRole} to ${newRole}. Related data has been updated.`);
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee. Please try again.');
    }
  };
 
  const handleAssignProject = async (employeeId, projectId) => {
    try {
      const batch = writeBatch(db);
     
      const selectedEmployeeDoc = await getDoc(doc(db, 'users', employeeId));
      if (!selectedEmployeeDoc.exists()) {
        throw new Error('Employee not found');
      }
      const selectedEmployeeData = selectedEmployeeDoc.data();
      const employeeEmpId = selectedEmployeeData.empId;
      const employeeName = `${selectedEmployeeData.firstName} ${selectedEmployeeData.lastName}`;
 
      const selectedProjectData = PREDEFINED_PROJECTS.find(p => p.name === projectId);
      if (!selectedProjectData) {
        throw new Error('Invalid project selected');
      }
 
      const projectRef = doc(collection(db, 'projects'), projectId);
      const projectDoc = await getDoc(projectRef);
     
      // If project doesn't exist, create it
      if (!projectDoc.exists()) {
        const newProjectData = {
          name: selectedProjectData.name,
          description: selectedProjectData.description,
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          teamLeadId: employeeEmpId, // Use empId here
          teamLeadName: employeeName,
          teamMembers: [],
          createdAt: new Date().toISOString(),
          createdBy: 'admin',
          updatedAt: new Date().toISOString(),
          updatedBy: 'admin'
        };
 
        batch.set(projectRef, newProjectData);
      } else {
        // Update existing project
        batch.update(projectRef, {
          teamLeadId: employeeEmpId, // Use empId here
          teamLeadName: employeeName,
          updatedAt: new Date().toISOString(),
          updatedBy: 'admin'
        });
      }
 
      // Update employee's project assignment
      const employeeRef = doc(db, 'users', employeeId);
      batch.update(employeeRef, {
        assignedProject: projectId, // Store the project name (used as ID)
        updatedAt: new Date().toISOString()
      });
 
      // Update org chart
      const orgChartQuery = query(collection(db, 'orgChart'), where('empId', '==', selectedEmployeeData.empId));
      const orgChartSnapshot = await getFirestoreDocs(orgChartQuery);
     
      if (!orgChartSnapshot.empty) {
        const orgChartDoc = orgChartSnapshot.docs[0];
        batch.update(doc(db, 'orgChart', orgChartDoc.id), {
          assignedProject: projectId, // Store the project name (used as ID)
          projectName: selectedProjectData.name,
          updatedAt: new Date().toISOString()
        });
      }
 
      await batch.commit();
      toast.success('Project assigned successfully');
      setIsProjectModalOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error assigning project:', error);
      toast.error('Failed to assign project');
    }
  };
 
  const handleRemoveTeamLead = async (employeeId) => {
    try {
      const batch = writeBatch(db);
      
      const selectedEmployeeDoc = await getDoc(doc(db, 'users', employeeId));
      if (!selectedEmployeeDoc.exists()) {
        throw new Error('Employee not found');
      }
      const selectedEmployeeData = selectedEmployeeDoc.data();
      const employeeEmpId = selectedEmployeeData.empId;

      // Find and update all projects where this employee is a team lead
      const projectsQuery = query(collection(db, 'projects'), where('teamLeadId', '==', employeeEmpId));
      const projectsSnapshot = await getDocs(projectsQuery);
      
      if (!projectsSnapshot.empty) {
        projectsSnapshot.forEach((projectDoc) => {
          batch.update(doc(db, 'projects', projectDoc.id), {
            teamLeadId: null,
            teamLeadName: null,
            updatedAt: new Date().toISOString(),
            updatedBy: 'admin'
          });
        });
      }

      // Also clear the assignedProject field for the employee in the users collection
      batch.update(doc(db, 'users', employeeId), {
        assignedProject: null,
        updatedAt: new Date().toISOString()
      });

      await batch.commit();
      toast.success('Team lead removed from projects successfully');
      fetchEmployees();
      fetchProjects();
    } catch (error) {
      console.error('Error removing team lead:', error);
      toast.error('Failed to remove team lead from projects');
    }
  };
 
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
              <p className="mt-1 text-sm text-gray-500">Manage and organize your workforce efficiently</p>
            </div>
            <Link
              to="/admin/A-employees/import"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <FaPlus className="mr-2" />
              Add New Employee
            </Link>
          </div>
        </div>
 
        {/* Compact Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search Bar */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow duration-200"
                />
              </div>
            </div>
 
            {/* Filter Dropdown */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <FaFilter className="mr-2" />
                  Filters
                  {Object.values(filters).some(Boolean) && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {Object.values(filters).filter(Boolean).length}
                    </span>
                  )}
                </button>
 
                {/* Filter Dropdown Menu */}
                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
                        {Object.values(filters).some(Boolean) && (
                          <button
                            type="button"
                            onClick={clearFilters}
                            className="text-sm text-indigo-600 hover:text-indigo-900"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                     
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Role</label>
                          <select
                            value={filters.role}
                            onChange={(e) => handleFilterChange('role', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">All Roles</option>
                            {ROLE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
 
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Department</label>
                          <select
                            value={filters.department}
                            onChange={(e) => handleFilterChange('department', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">All Departments</option>
                            {departments.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                        </div>
 
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Status</label>
                          <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
 
              {/* Active Filters Display */}
              {Object.values(filters).some(Boolean) && (
                <div className="flex items-center space-x-2">
                  {Object.entries(filters).map(([key, value]) => (
                    value && (
                      <span
                        key={key}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {key}: {value}
                        <button
                          type="button"
                          onClick={() => handleFilterChange(key, '')}
                          className="ml-1 text-indigo-600 hover:text-indigo-900"
                        >
                          <FaTimes className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
 
          {/* Results Count */}
          <div className="mt-2 text-sm text-gray-500">
            Showing {filteredEmployees.length} of {employees.length} employees
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        </div>
 
        {/* Employees Table Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Project
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-full ring-2 ring-white"
                            src={employee.image || `https://ui-avatars.com/api/?name=${employee.firstName}+${employee.lastName}&background=random`}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {employee.empId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee.role === 'hr' ? 'bg-blue-100 text-blue-800' :
                        employee.role === 'manager' ? 'bg-green-100 text-green-800' :
                        employee.role === 'supermanager' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ROLE_OPTIONS.find(option => option.value === employee.role)?.label || 'Employee'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.department}</div>
                      <div className="text-sm text-gray-500">{employee.designation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.assignedProject || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.email}</div>
                      <div className="text-sm text-gray-500">{employee.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1">
                        {employee.role === 'manager' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setIsProjectModalOpen(true);
                              }}
                              className="p-2 rounded-full text-green-600 hover:bg-green-100 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-200"
                              title="Assign Project"
                            >
                              <FaTasks className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleRemoveTeamLead(employee.id)}
                              className="p-2 rounded-full text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition-all duration-200"
                              title="Remove from Projects"
                            >
                              <FaUserMinus className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(employee)}
                          className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-200"
                          title="Edit Employee"
                        >
                          <FaEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee)}
                          className="p-2 rounded-full text-red-600 hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-200"
                          title="Delete Employee"
                        >
                          <FaTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
 
        {/* Edit Modal */}
        {isEditModalOpen && selectedEmployee && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Employee</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updatedData = Object.fromEntries(formData.entries());
                handleUpdate(updatedData);
              }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      defaultValue={selectedEmployee.firstName}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      defaultValue={selectedEmployee.lastName}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={selectedEmployee.email}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={selectedEmployee.phone}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input
                      type="text"
                      name="department"
                      defaultValue={selectedEmployee.department}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      name="role"
                      defaultValue={selectedEmployee.role}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    >
                      <option value="">Select a role</option>
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
 
        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedEmployee && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="flex items-center justify-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <FaTrash className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Employee</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete {selectedEmployee.firstName} {selectedEmployee.lastName}? This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
 
        {/* Project Assignment Modal */}
        {isProjectModalOpen && selectedEmployee && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Assign Project</h2>
                <button
                  onClick={() => setIsProjectModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Assign a project to {selectedEmployee.firstName} {selectedEmployee.lastName}
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
                  <select
                    value={selectedProject?.name || ''}
                    onChange={(e) => {
                      const project = PREDEFINED_PROJECTS.find(p => p.name === e.target.value);
                      setSelectedProject(project ? {
                        id: project.name,
                        name: project.name,
                        description: project.description,
                        status: 'active',
                        startDate: new Date().toISOString().split('T')[0],
                        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                      } : null);
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a Project</option>
                    {PREDEFINED_PROJECTS.map((project) => (
                      <option key={project.name} value={project.name}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedProject && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">{selectedProject.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{selectedProject.description}</p>
                  </div>
                )}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setIsProjectModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => selectedProject && handleAssignProject(selectedEmployee.id, selectedProject.id)}
                    disabled={!selectedProject}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
                  >
                    Assign Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default Employees;
