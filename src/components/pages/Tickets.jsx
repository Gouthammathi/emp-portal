import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaTicketAlt, FaUserPlus, FaCheck, FaSpinner, FaUsers, FaEye, FaClock, FaCheckCircle, FaInbox } from 'react-icons/fa';
import orgChartData from '../../data/orgchart.json';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState('new');
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending'
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
        if (!userDoc.empty) {
          const data = userDoc.docs[0].data();
          setUserData(data);
          setUserRole(data.role);
          
          // Fetch team members from org chart only for team leads and managers
          if (data.role === 'tl' || data.role === 'manager') {
            if (data.empId) {
              const orgChartTeamMembers = orgChartData.organizationChart.filter(
                emp => String(emp.managerId) === String(data.empId)
              );
              
              // Get registered team members
              const registeredTeamMembers = [];
              for (const member of orgChartTeamMembers) {
                const userQuery = query(
                  collection(db, 'users'),
                  where('empId', '==', member.empId)
                );
                const userSnapshot = await getDocs(userQuery);
                if (!userSnapshot.empty) {
                  registeredTeamMembers.push({
                    ...member,
                    ...userSnapshot.docs[0].data()
                  });
                }
              }
              setTeamMembers(registeredTeamMembers);
            }
          }
        }
      }
    };

    const fetchTickets = async () => {
      let ticketsQuery;
      
      // If user is an employee, only fetch their assigned tickets
      if (userData?.role === 'employee') {
        ticketsQuery = query(
          collection(db, 'tickets'),
          where('assignedTo', '==', userData.empId),
          orderBy('createdAt', 'desc')
        );
      } else {
        // For team leads and managers, fetch all tickets
        ticketsQuery = query(
          collection(db, 'tickets'),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(ticketsQuery);
      const ticketList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(ticketList);
      setLoading(false);
    };

    fetchUserData();
    fetchTickets();
  }, [userData]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const ticketData = {
        ...newTicket,
        assignedBy: userData?.firstName + ' ' + userData?.lastName,
        createdAt: new Date(),
        dueDate: new Date(newTicket.dueDate),
        status: 'new'
      };

      await addDoc(collection(db, 'tickets'), ticketData);
      setShowCreateModal(false);
      setNewTicket({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        priority: 'medium',
        status: 'pending'
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const handleAssignTicket = async (ticketId, employeeId) => {
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      await updateDoc(ticketRef, { 
        assignedTo: employeeId,
        status: 'ongoing',
        assignedAt: new Date()
      });
      setShowAssignModal(false);
      setSelectedTicket(null);
    } catch (error) {
      console.error('Error assigning ticket:', error);
    }
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      await updateDoc(ticketRef, { 
        status: newStatus,
        ...(newStatus === 'closed' && { closedAt: new Date() })
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const getFilteredTickets = () => {
    const filtered = tickets.filter(ticket => {
      switch (activeTab) {
        case 'new':
          return ticket.status === 'new';
        case 'ongoing':
          return ticket.status === 'ongoing';
        case 'closed':
          return ticket.status === 'closed';
        default:
          return true;
      }
    });
    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const NoTicketsMessage = () => (
    <div className="text-center py-12">
      <FaInbox className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
      <p className="mt-1 text-sm text-gray-500">
        {userRole === 'employee' 
          ? "You don't have any tickets assigned to you at the moment."
          : "There are no tickets in this category at the moment."}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Ticket Management</h1>
          {(userRole === 'tl' || userRole === 'manager') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaTicketAlt /> Create New Ticket
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('new')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'new'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaTicketAlt className="inline-block mr-2" />
                New Tickets
              </button>
              <button
                onClick={() => setActiveTab('ongoing')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'ongoing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaClock className="inline-block mr-2" />
                Ongoing Tickets
              </button>
              <button
                onClick={() => setActiveTab('closed')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'closed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaCheckCircle className="inline-block mr-2" />
                Closed Tickets
              </button>
            </nav>
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {getFilteredTickets().length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    {userRole !== 'employee' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredTickets().map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                        <div className="text-sm text-gray-500">{ticket.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      {userRole !== 'employee' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {ticket.assignedTo ? (
                              teamMembers.find(m => m.empId === ticket.assignedTo)?.firstName + ' ' +
                              teamMembers.find(m => m.empId === ticket.assignedTo)?.lastName
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setShowAssignModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                              >
                                <FaUsers className="w-4 h-4" />
                                Assign to
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ticket.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowViewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        {ticket.status === 'ongoing' && (
                          <button
                            onClick={() => handleStatusUpdate(ticket.id, 'closed')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FaCheck className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <NoTicketsMessage />
          )}
        </div>

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Ticket</h3>
                <form onSubmit={handleCreateTicket}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                    <input
                      type="text"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                    <textarea
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      rows="3"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Due Date</label>
                    <input
                      type="date"
                      value={newTicket.dueDate}
                      onChange={(e) => setNewTicket({...newTicket, dueDate: e.target.value})}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Priority</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Create Ticket
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Assign Ticket Modal */}
        {showAssignModal && selectedTicket && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Ticket</h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Select a team member to assign this ticket:</p>
                  <div className="space-y-2">
                    {teamMembers.map((member) => (
                      <button
                        key={member.empId}
                        onClick={() => handleAssignTicket(selectedTicket.id, member.empId)}
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {member.firstName[0]}{member.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                          <p className="text-xs text-gray-500">ID: {member.empId}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedTicket(null);
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Ticket Modal */}
        {showViewModal && selectedTicket && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ticket Details</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Title</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedTicket.title}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Description</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedTicket.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Priority</h4>
                      <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Status</h4>
                      <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedTicket.status)}`}>
                        {selectedTicket.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Assigned To</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedTicket.assignedTo ? (
                          teamMembers.find(m => m.empId === selectedTicket.assignedTo)?.firstName + ' ' +
                          teamMembers.find(m => m.empId === selectedTicket.assignedTo)?.lastName
                        ) : 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedTicket.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {selectedTicket.status === 'closed' && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Resolved By</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {teamMembers.find(m => m.empId === selectedTicket.assignedTo)?.firstName + ' ' +
                         teamMembers.find(m => m.empId === selectedTicket.assignedTo)?.lastName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Closed on: {new Date(selectedTicket.closedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedTicket(null);
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Close
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

export default Tickets; 