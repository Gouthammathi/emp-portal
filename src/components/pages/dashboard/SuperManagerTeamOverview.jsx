import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { FaUserCircle, FaChevronDown, FaChevronRight, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SuperManagerTeamOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teamStructure, setTeamStructure] = useState([]);
  const [expandedTeams, setExpandedTeams] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStructure, setFilteredStructure] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log("User data:", data);

            // Get all managers under this super manager
            const managersQuery = query(
              collection(db, "users"),
              where("superManagerId", "==", data.empId)
            );
            const managersSnapshot = await getDocs(managersQuery);
            
            const structure = [];
            
            // For each manager, get their team members
            for (const managerDoc of managersSnapshot.docs) {
              const managerData = managerDoc.data();
              
              // Get team members for this manager
              const teamQuery = query(
                collection(db, "users"),
                where("managerId", "==", managerData.empId)
              );
              const teamSnapshot = await getDocs(teamQuery);
              
              const teamMembers = teamSnapshot.docs.map(memberDoc => {
                const memberData = memberDoc.data();
                return {
                  empId: memberData.empId,
                  firstName: memberData.firstName,
                  lastName: memberData.lastName,
                  title: memberData.designation || 'Employee',
                  image: memberData.profileImage || null
                };
              });

              structure.push({
                empId: managerData.empId,
                firstName: managerData.firstName,
                lastName: managerData.lastName,
                title: managerData.designation || 'Manager',
                image: managerData.profileImage || null,
                teamMembers: teamMembers
              });
            }

            console.log("Built structure:", structure);

            if (structure.length === 0) {
              setError("No team members found under your management.");
            } else {
              setTeamStructure(structure);
              setFilteredStructure(structure);
            }
          } else {
            setError("User data not found.");
          }
        } else {
          setError("No authenticated user found.");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load team data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const toggleTeam = (managerId) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(managerId)) {
        newSet.delete(managerId);
      } else {
        newSet.add(managerId);
      }
      return newSet;
    });
  };

  const handleSearch = (e) => {
    const search = e.target.value.toLowerCase();
    setSearchTerm(search);

    if (!search) {
      setFilteredStructure(teamStructure);
      return;
    }

    const filtered = teamStructure.map(manager => {
      const filteredTeamMembers = manager.teamMembers.filter(member =>
        member.firstName?.toLowerCase().includes(search) ||
        member.lastName?.toLowerCase().includes(search) ||
        member.title?.toLowerCase().includes(search) ||
        member.empId?.toLowerCase().includes(search)
      );

      if (
        manager.firstName?.toLowerCase().includes(search) ||
        manager.lastName?.toLowerCase().includes(search) ||
        manager.title?.toLowerCase().includes(search) ||
        manager.empId?.toLowerCase().includes(search) ||
        filteredTeamMembers.length > 0
      ) {
        return {
          ...manager,
          teamMembers: filteredTeamMembers
        };
      }
      return null;
    }).filter(Boolean);

    setFilteredStructure(filtered);
  };

  const handleMemberClick = (member) => {
    navigate(`/team-member/${member.empId}`, {
      state: {
        member: {
          employeeName: `${member.firstName} ${member.lastName}`,
          empId: member.empId,
          designation: member.title
        }
      }
    });
  };

  const handleManagerClick = (manager) => {
    navigate(`/team-member/${manager.empId}`, {
      state: {
        member: {
          employeeName: `${manager.firstName} ${manager.lastName}`,
          empId: manager.empId,
          designation: manager.title
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading team data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Team Overview</h1>
            <p className="mt-2 text-gray-600">View and manage your team structure</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (teamStructure.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Team Overview</h1>
            <p className="mt-2 text-gray-600">View and manage your team structure</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-600">No team members found under your management.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Team Overview</h1>
          <p className="mt-2 text-gray-600">View and manage your team structure</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Team Structure */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-6">
            {filteredStructure.map((manager) => (
              <div key={manager.empId} className="border border-gray-200 rounded-lg">
                {/* Manager Card */}
                <div className="flex">
                  <div
                    className="p-4 bg-gray-50 rounded-t-lg flex items-center justify-between cursor-pointer hover:bg-gray-100 flex-grow"
                    onClick={() => toggleTeam(manager.empId)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                        {manager.firstName?.[0]}{manager.lastName?.[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {manager.firstName} {manager.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{manager.title}</p>
                        <p className="text-xs text-gray-500">ID: {manager.empId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {manager.teamMembers.length} team members
                      </span>
                      {expandedTeams.has(manager.empId) ? (
                        <FaChevronDown className="text-gray-500" />
                      ) : (
                        <FaChevronRight className="text-gray-500" />
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManagerClick(manager);
                    }}
                    className="px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-r-lg flex items-center justify-center transition-colors"
                  >
                    View Details
                  </button>
                </div>

                {/* Team Members */}
                {expandedTeams.has(manager.empId) && (
                  <div className="p-4 space-y-4">
                    {manager.teamMembers.map((member) => (
                      <div
                        key={member.empId}
                        onClick={() => handleMemberClick(member)}
                        className="flex items-center space-x-4 p-3 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </h4>
                          <p className="text-xs text-gray-600">{member.title}</p>
                          <p className="text-xs text-gray-500">ID: {member.empId}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperManagerTeamOverview;
 