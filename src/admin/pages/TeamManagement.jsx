import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaTimes, FaUsers, FaUserPlus, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    status: '',
  });
  const [departments, setDepartments] = useState([]);
  const [newTeam, setNewTeam] = useState({
    name: '',
    department: '',
    description: '',
    teamLeadId: '',
    teamLeadName: '',
    members: [],
    status: 'active',
  });
  const [employees, setEmployees] = useState([]);
  const [searchEmployeeTerm, setSearchEmployeeTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isEmployeeSearchOpen, setIsEmployeeSearchOpen] = useState(false);

  useEffect(() => {
    fetchTeams();
    fetchEmployees();
  }, []);

  const fetchTeams = async () => {
    try {
      const teamsRef = collection(db, 'teams');
      const snapshot = await getDocs(teamsRef);
      const teamsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeams(teamsList);
      
      // Extract unique departments
      const uniqueDepartments = [...new Set(teamsList.map(team => team.department))].filter(Boolean);
      setDepartments(uniqueDepartments);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to fetch teams');
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const employeesList = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(user => user.role?.toLowerCase() === 'employee');
      setEmployees(employeesList);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      status: '',
    });
  };

  const filteredTeams = teams.filter(team => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      team.name?.toLowerCase().includes(searchTermLower) ||
      team.department?.toLowerCase().includes(searchTermLower) ||
      team.teamLeadName?.toLowerCase().includes(searchTermLower);

    const matchesDepartment = !filters.department || team.department === filters.department;
    const matchesStatus = !filters.status || team.status === filters.status;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const filteredEmployees = employees.filter(employee => {
    const searchTermLower = searchEmployeeTerm.toLowerCase();
    return (
      employee.name?.toLowerCase().includes(searchTermLower) ||
      employee.email?.toLowerCase().includes(searchTermLower) ||
      employee.employeeId?.toLowerCase().includes(searchTermLower)
    );
  });

  const handleAddEmployee = (employee) => {
    // Validate employee data before adding
    if (!employee || !employee.id || !employee.name) {
      toast.error('Invalid employee data');
      return;
    }

    if (!selectedEmployees.find(e => e.id === employee.id)) {
      setSelectedEmployees([...selectedEmployees, {
        id: employee.id,
        name: employee.name || '',
        email: employee.email || '',
        employeeId: employee.employeeId || ''
      }]);
    }
  };

  const handleRemoveEmployee = (employeeId) => {
    setSelectedEmployees(selectedEmployees.filter(e => e.id !== employeeId));
  };

  const handleCreateTeam = async () => {
    try {
      // Validate required fields
      if (!newTeam.name || !newTeam.department) {
        toast.error('Team name and department are required');
        return;
      }

      // Prepare team members data with validation
      const validatedMembers = selectedEmployees.map(emp => ({
        id: emp.id || '',
        name: emp.name || '',
        email: emp.email || '',
        employeeId: emp.employeeId || ''
      })).filter(member => member.id && member.name); // Only include members with valid IDs and names

      const teamData = {
        name: newTeam.name,
        department: newTeam.department,
        description: newTeam.description || '',
        teamLeadId: newTeam.teamLeadId || '',
        teamLeadName: newTeam.teamLeadName || '',
        members: validatedMembers,
        status: newTeam.status || 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      };

      const teamsRef = collection(db, 'teams');
      await addDoc(teamsRef, teamData);
      
      toast.success('Team created successfully');
      setIsCreateModalOpen(false);
      setNewTeam({
        name: '',
        department: '',
        description: '',
        teamLeadId: '',
        teamLeadName: '',
        members: [],
        status: 'active',
      });
      setSelectedEmployees([]);
      fetchTeams();
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error(error.message || 'Failed to create team');
    }
  };

  const handleEditTeam = async () => {
    try {
      const teamRef = doc(db, 'teams', selectedTeam.id);
      await updateDoc(teamRef, {
        ...selectedTeam,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      });
      toast.success('Team updated successfully');
      setIsEditModalOpen(false);
      fetchTeams();
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Failed to update team');
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await deleteDoc(doc(db, 'teams', selectedTeam.id));
      toast.success('Team deleted successfully');
      setIsDeleteModalOpen(false);
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
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
              <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
              <p className="mt-1 text-sm text-gray-500">Create and manage teams efficiently</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <FaPlus className="mr-2" />
              Create New Team
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
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
                  placeholder="Search teams..."
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
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div key={team.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500">{team.department}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setIsEditModalOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <FaEdit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaUsers className="mr-2" />
                    <span>{team.members?.length || 0} Members</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Team Lead: {team.teamLeadName || 'Not Assigned'}
                    </p>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      team.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {team.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Team Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Team</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateTeam();
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Team Name</label>
                    <input
                      type="text"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input
                      type="text"
                      value={newTeam.department}
                      onChange={(e) => setNewTeam({ ...newTeam, department: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newTeam.description}
                      onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Team Lead</label>
                    <input
                      type="text"
                      value={newTeam.teamLeadName}
                      onChange={(e) => setNewTeam({ ...newTeam, teamLeadName: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsEmployeeSearchOpen(!isEmployeeSearchOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <span>Add Team Members</span>
                        <FaUserPlus className="h-5 w-5 text-gray-400" />
                      </button>

                      {isEmployeeSearchOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
                          <div className="p-2">
                            <input
                              type="text"
                              placeholder="Search employees..."
                              value={searchEmployeeTerm}
                              onChange={(e) => setSearchEmployeeTerm(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {filteredEmployees.map((employee) => (
                              <div
                                key={employee.id}
                                className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleAddEmployee(employee)}
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                                  <p className="text-xs text-gray-500">{employee.email}</p>
                                </div>
                                {selectedEmployees.find(e => e.id === employee.id) && (
                                  <FaCheck className="h-5 w-5 text-green-500" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Selected Team Members */}
                    <div className="mt-4 space-y-2">
                      {selectedEmployees.map((employee) => (
                        <div
                          key={employee.id}
                          className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                            <p className="text-xs text-gray-500">{employee.email}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveEmployee(employee.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTimes className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Team Modal */}
        {isEditModalOpen && selectedTeam && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Team</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleEditTeam();
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Team Name</label>
                    <input
                      type="text"
                      value={selectedTeam.name}
                      onChange={(e) => setSelectedTeam({ ...selectedTeam, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input
                      type="text"
                      value={selectedTeam.department}
                      onChange={(e) => setSelectedTeam({ ...selectedTeam, department: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={selectedTeam.description}
                      onChange={(e) => setSelectedTeam({ ...selectedTeam, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Team Lead</label>
                    <input
                      type="text"
                      value={selectedTeam.teamLeadName}
                      onChange={(e) => setSelectedTeam({ ...selectedTeam, teamLeadName: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={selectedTeam.status}
                      onChange={(e) => setSelectedTeam({ ...selectedTeam, status: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedTeam && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="flex items-center justify-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <FaTrash className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Team</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete {selectedTeam.name}? This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteTeam}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
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

export default TeamManagement;
